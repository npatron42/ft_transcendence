from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from asgiref.sync import sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from users.serializers import UserSerializer, InvitationSerializer, FriendsListSerializer, MessageSerializer
from users.models import Invitation, User, FriendsList, Message
logger = logging.getLogger(__name__)
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.db.models import Q
import logging
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)
pool_lock = asyncio.Lock()

# UTILS FUNCTIONS FOR USER STATUS

socketsUsers = {}
usersPool = {}
usersStatus = {}

async def finalFriendsList(friendsList):
    size = len(friendsList)
    result = []
    i = 0
    while i < size:
        username = friendsList[i]
        myUser = await getUserByUsername(username)
        result.append(myUser)
        i += 1
    return (result)


async def sendToEveryClientsUsersList(channel_layer):
    size = len(socketsUsers)
    i = 0
    usersConnected = list(socketsUsers.keys())
    sockets = list(socketsUsers.values())
    while i < size:
        allUsersTmp = await getAllUser()
        allUsers = UserSerializer(allUsersTmp, many=True)

        myUser = await getUserByUsername(usersConnected[i])

        myUserFriendsList = await getFriendsListByUsername(myUser.username)
        friendsListSerializer = FriendsListSerializer(myUserFriendsList, many=True)

        friendsNames = giveOnlyFriendsName(friendsListSerializer.data, myUser.username)

        final = await finalFriendsList(friendsNames)
        serializerFinal = UserSerializer(final, many=True)

        myUserListTmp = await usersListWithoutFriends(serializerFinal.data, allUsers.data, myUser.username)

        myUserList = UserSerializer(myUserListTmp, many=True)
        dataToSend = {
            "AllUsers": myUserList.data
        }
        friendsToSend = {
            "friends": serializerFinal.data
        }
        await sendToClient(channel_layer, sockets[i], friendsToSend)
        await sendToClient(channel_layer, sockets[i], dataToSend)
        i += 1

# UTILS FUNCTIONS FOR THE WAITINGINVITATIONS


async def getUserByUsername(name):
    return await sync_to_async(User.objects.get)(username=name)

async def getUserById(myId):
    return await sync_to_async(User.objects.get)(id=myId)

async def getAllUser():
    users = await sync_to_async(list)(User.objects.all())
    return users

async def saveInvitation(myInvitation):
    await sync_to_async(myInvitation.save)()

async def saveMessage(myMessage):
    await sync_to_async(myMessage.save)()

async def saveRelationship(myFriendsList):
    await sync_to_async(myFriendsList.save)()

async def checkInvitation(parse_value):
    alreadyFriends = await RelationshipIsExisting(parse_value)
    if (alreadyFriends == True):
        return ("ALREADY FRIENDS")
    invitation_exists = await sync_to_async(
        lambda: Invitation.objects.filter(parse=parse_value).exists()
    )()
    if (invitation_exists == True):
        return invitation_exists
    
    key1, key2 = parse_value.split("|", 1)
    newStr = key2 + "|" + key1
    otherinvitation_exists = await sync_to_async(
        lambda: Invitation.objects.filter(parse=newStr).exists()
    )()

    if (invitation_exists == False and otherinvitation_exists == False):
        return (False)
    elif (invitation_exists == True and otherinvitation_exists == False
        or invitation_exists == False and otherinvitation_exists == True):
        return ("FRIENDS NOW")
    return (True)



async def RelationshipIsExisting(parse_value):
    relationship_exists = await sync_to_async(
        lambda: FriendsList.objects.filter(parse=parse_value).exists()
    )()
    if (relationship_exists == True):
        return relationship_exists
    key1, key2 = parse_value.split("|", 1)
    newStr = key2 + "|" + key1
    otherRelation_exists = await sync_to_async(
        lambda: FriendsList.objects.filter(parse=newStr).exists()
    )()
    if (otherRelation_exists == False and relationship_exists == False):
        return (False)
    return (True)

async def eraseInvitation(parse_value):
    key1, key2 = parse_value.split("|", 1)
    other_value = key2 + "|" + key1
    try:
        myInvitation = await sync_to_async(Invitation.objects.get)(parse=parse_value)
        await sync_to_async(myInvitation.delete)()
    except:
        myInvitation = await sync_to_async(Invitation.objects.get)(parse=other_value)
        await sync_to_async(myInvitation.delete)()
        pass


async def removeFriend(parse_value):
    key1, key2 = parse_value.split("|", 1)
    other_value = key2 + "|" + key1
    try:
        myRelationShip = await sync_to_async(FriendsList.objects.get)(parse=parse_value)
        await sync_to_async(myRelationShip.delete)()
    except:
        myRelationShip = await sync_to_async(FriendsList.objects.get)(parse=other_value)
        await sync_to_async(myRelationShip.delete)()
        pass   

async def getFriendsListByUsername(username):
    user = await sync_to_async(User.objects.get)(username=username)
    friends_relationships = await sync_to_async(lambda: list(
        FriendsList.objects.filter(Q(user1=user) | Q(user2=user))
    ))()
    
    return friends_relationships

def giveOnlyFriendsName(friendsList, myUsername):
    result = []

    size = len(friendsList)
    i = 0

    while i < size:
        parse_value = friendsList[i].get("parse")
        usernames = parse_value.split("|")
        for username in usernames:
            if username != myUsername:
                result.append(username)
        i += 1
    return result


async def usersListWithoutFriends(friendsList, AllUsers, myUsername): 
    allFriendsName = []
    size = len(friendsList)
    i = 0
    while i < size:
            allFriendsName.append(friendsList[i].get("username"))
            i += 1

    allUsersnames = []
    size = len(AllUsers)
    i = 0
    while i < size:
        allUsersnames.append(AllUsers[i].get("username"))
        i += 1
    allUsersnames.remove(myUsername)

    result = []
    i = 0
    size = len(allUsersnames)
    while i < size:
        username = allUsersnames[i]
        if username not in allFriendsName:
            result.append(username)
        i += 1
    i = 0
    userResult = []
    size = len(result)
    if size == 0:
        return userResult
    while i < size:
        myUser = await getUserByUsername(result[i])
        userResult.append(myUser)
        i += 1
    return userResult


async def deleteRelationShip(parseLine):
    key, key2 = parseLine.split("|", 1)
    solution1 = parseLine
    solution2 = key2 + "|" + key

    try:
        myRelation = await sync_to_async(FriendsList.objects.get)(parse=solution1)
    except ObjectDoesNotExist:
        try:
            myRelation = await sync_to_async(FriendsList.objects.get)(parse=solution2)
        except ObjectDoesNotExist:
            return

    await sync_to_async(myRelation.delete)()

async def sendToClient2(self, socket, message):
    await self.channel_layer.send(socket, {
        "type": "notification_to_client",
        "message": message,
    })


async def getAllNotifications(username):
    result = []

    myUser = await getUserByUsername(username)
    id = myUser.id

    allInvitationsTmp = await sync_to_async(list)(Invitation.objects.filter(receiver=id))

    allInvitations = await sync_to_async(InvitationSerializer)(allInvitationsTmp, many=True)

    for invitation in allInvitations.data:
        idInvitation = invitation.get("receiver")
        if idInvitation == id:
            userToAddTmp = await getUserById(invitation.get("expeditor"))
            userToAdd = await sync_to_async(UserSerializer)(userToAddTmp)
            result.append(userToAdd.data)

    dataToSend = {
        "friendsInvitations": result
    }
    return dataToSend





async def sendDiscussionToBothClient(self, userOne, userTwo):
    messages = await sync_to_async(list)(
        Message.objects.filter(
            (Q(sender=userOne) & Q(receiver=userTwo) |
            (Q(sender=userTwo) & Q(receiver=userOne))
        ))
    )

    serializedMessages = await sync_to_async(MessageSerializer)(messages, many=True)

    dataToSend = {
        "messages": serializedMessages.data
    }

    if userOne.username in socketsUsers:
        logger.info("OUI")
        socketUserOne = socketsUsers.get(userOne.username)
        await sendToClient2(self, socketUserOne, dataToSend)
    
    if userTwo.username in socketsUsers:
        logger.info("OUI")
        socketUserTwo = socketsUsers.get(userTwo.username)
        await sendToClient2(self, socketUserTwo, dataToSend)



async def changeUserStatus(key, isConnected: bool):
    usersStatus[key] = isConnected

async def addToPool(key, value):
    async with pool_lock:
        usersPool[key.username] = value

async def getFromPool(key):
    async with pool_lock:
        return usersPool.get(key.username, None)

async def removeFromPool(key):
    async with pool_lock:
        usersPool.pop(key.username, None)

async def update_user_status(user, status):
    user.status = status
    await sync_to_async(user.save)()

async def sendToClient(channel_layer, socket, message):
    await channel_layer.send(socket, {
        "type": "notif",
        "message": message,
    })

class handleSocketConsumer(AsyncWebsocketConsumer):

    async def notification_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    async def notification_to_client(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    async def send_notif(self, notif):
        await self.channel_layer.group_send(
            "notification",
            {
                "type": "notification_message",
                "message": notif,
            }
        )

    async def send_status_to_all(self):
        dataToSend = {
            "status": usersStatus
        }
        await self.channel_layer.group_send(
            "status_updates",
            {
                "type": "status_message",
                "message": dataToSend,
            }
        )

    async def notif(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
        
    async def status_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))


    ## CONNECT ##


    async def connect(self):
        if self.scope['user'].is_authenticated:
            await self.channel_layer.group_add("notification", self.channel_name)
            await self.channel_layer.group_add("invitations", self.channel_name)
            await self.channel_layer.group_add("status_updates", self.channel_name)

            mySocket = self.channel_name
            myUser = self.scope['user']

            socketsUsers[myUser.username] = mySocket

            await addToPool(myUser, self.channel_name)
            await changeUserStatus(myUser.username, True)
            await self.accept()

            await self.send_status_to_all()
            await update_user_status(myUser, "online")
            await sendToEveryClientsUsersList(self.channel_layer)
        else:
            await self.close()


    ## DISCONNECT ##


    async def disconnect(self, close_code):
        myUser = self.scope['user']

        if myUser.username in socketsUsers:
            del socketsUsers[myUser.username]
        pass;

        await removeFromPool(myUser)
        await changeUserStatus(myUser.username, False)
        await self.channel_layer.group_discard("status_updates", self.channel_name)

        await self.send_status_to_all()
        socketsUsers.pop(myUser.username, None)
        await update_user_status(myUser, "offline")
    

    ## RECEIVE ##


    async def receive(self, text_data):

        data = json.loads(text_data);

        type = data["type"]
        myUser = self.scope["user"]
        # INVITE METHODE
        if (type == "INVITE"):
            myReceiverUsername = data.get('to')
            typeMessage = data.get('type')
            parse = data.get('parse')

            myExpeditor = self.scope['user']
            myReceiver = await getUserByUsername(myReceiverUsername)
            socketReceiver = socketsUsers.get(myReceiverUsername)

            myInvitation = Invitation(expeditor=myExpeditor, receiver=myReceiver, message=typeMessage, parse=parse)
            invitation_exists = await checkInvitation(parse)

            if (invitation_exists == "FRIENDS NOW"): # USERS FRIENDS

                friendsList = FriendsList(user1=myExpeditor, user2=myReceiver, parse=parse)
                await saveRelationship(friendsList)
                await eraseInvitation(parse)

                friendsListExpeditor = await getFriendsListByUsername(myExpeditor.username)
                serializerExpeditor = FriendsListSerializer(friendsListExpeditor, many=True)

                friendsListReceiver = await getFriendsListByUsername(myReceiver.username)
                serializerReceiver = FriendsListSerializer(friendsListReceiver, many=True)



                allUsersTmp = await getAllUser()
                serializer_user = UserSerializer(allUsersTmp, many=True)
                AllUsers = serializer_user.data

                friendsNamesExpeditor = giveOnlyFriendsName(serializerExpeditor.data, myExpeditor.username)
                friendsNamesReceiver = giveOnlyFriendsName(serializerReceiver.data, myReceiverUsername)



                finalFriendsListExpeditor = await finalFriendsList(friendsNamesExpeditor)
                serializerFinalExpeditor = UserSerializer(finalFriendsListExpeditor, many=True)

                finalFriendsListReceiver = await finalFriendsList(friendsNamesReceiver)
                serializerFinalReceiver = UserSerializer(finalFriendsListReceiver, many=True)

                friendsListReceiverToSend = {
                    "friends": serializerFinalReceiver.data
                }

                friendsListExpeditorToSend = {
                    "friends": serializerFinalExpeditor.data
                }


                usersListExpeditor = await usersListWithoutFriends(serializerFinalExpeditor.data, AllUsers, myExpeditor.username)
                serializerAllUsersExpeditor = UserSerializer(usersListExpeditor, many=True)
                usersListReceiver = await usersListWithoutFriends(serializerFinalReceiver.data, AllUsers, myReceiverUsername)
                serializerAllUsersReceiver = UserSerializer(usersListReceiver, many=True)

                allUsersToSendExpeditor = {
                    "AllUsers": serializerAllUsersExpeditor.data
                }

                allUsersToSendReceiver = {
                    "AllUsers": serializerAllUsersReceiver.data
                }


                friendsInvitationsToReceiver = await getAllNotifications(myReceiverUsername)
                await sendToClient2(self, socketReceiver, friendsInvitationsToReceiver)

                friendsInvitationsToExpeditor = await getAllNotifications(myExpeditor.username)
                await self.send(text_data=json.dumps(friendsInvitationsToExpeditor))                

                await self.send(text_data=json.dumps(allUsersToSendExpeditor))
                await sendToClient2(self, socketReceiver, allUsersToSendReceiver)

                #friendsList to clients

                await self.send(text_data=json.dumps(friendsListExpeditorToSend))
                await sendToClient2(self, socketReceiver, friendsListReceiverToSend)



            elif (invitation_exists == "ALREADY FRIENDS"):
                sendData = {
                    "error": "Already friends"
                }
                await self.send(text_data=json.dumps(sendData))      



            elif (invitation_exists):
                sendData = {
                    "error": "Invitation already sent"
                }
                await self.send(text_data=json.dumps(sendData))

            else:
                await saveInvitation(myInvitation)

                userReceiverName = data["to"]

                dataToSend = await getAllNotifications(userReceiverName)
                await sendToClient2(self, socketReceiver, dataToSend)

        elif type == "DELETE":
            stringRelation = data["parse"]
            myUser = self.scope["user"]
            userDeleted = await getUserByUsername(data["userDeleted"])
            socketUserDeleted = socketsUsers.get(userDeleted.username)

            await deleteRelationShip(stringRelation)
            allUsersTmp = await getAllUser()
            serializer_user = UserSerializer(allUsersTmp, many=True)
            AllUsers = serializer_user.data

            myUserFriendsList = await getFriendsListByUsername(myUser.username)
            userDeletedFriendsList = await getFriendsListByUsername(userDeleted.username)

            serializerUserFriendsList = FriendsListSerializer(myUserFriendsList, many=True)
            serializerUserDeletedFriendsList = FriendsListSerializer(userDeletedFriendsList, many=True)

            friendsNamesUser = giveOnlyFriendsName(serializerUserFriendsList.data, myUser.username)
            friendsNamesDeletedUser = giveOnlyFriendsName(serializerUserDeletedFriendsList.data, userDeleted.username)

            finalFriendsListUser = await finalFriendsList(friendsNamesUser)
            serializerFinalUser = UserSerializer(finalFriendsListUser, many=True)

            finalFriendsListDeletedUser = await finalFriendsList(friendsNamesDeletedUser)
            serializerFinalDeletedUser = UserSerializer(finalFriendsListDeletedUser, many=True)

            friendsListDeletedUserToSend = {
                "friends": serializerFinalDeletedUser.data
            }

            friendsListUserToSend = {
                "friends": serializerFinalUser.data
            }

            usersListExpeditor = await usersListWithoutFriends(serializerFinalUser.data, AllUsers, myUser.username)
            serializerAllUsersExpeditor = UserSerializer(usersListExpeditor, many=True)

            usersListReceiver = await usersListWithoutFriends(serializerFinalDeletedUser.data, AllUsers, userDeleted.username)
            serializerAllUsersReceiver = UserSerializer(usersListReceiver, many=True)

            allUsersToSendExpeditor = {
                "AllUsers": serializerAllUsersExpeditor.data
            }

            allUsersToSendReceiver = {
                "AllUsers": serializerAllUsersReceiver.data
            }

            await self.send(text_data=json.dumps(friendsListUserToSend))   
            await sendToClient2(self, socketUserDeleted, friendsListDeletedUserToSend)

            await self.send(text_data=json.dumps(allUsersToSendExpeditor))   
            await sendToClient2(self, socketUserDeleted, allUsersToSendReceiver)

        elif type == "DECLINE":
            parse = data.get("parse")
            await eraseInvitation(parse)
            dataToSend = await getAllNotifications(myUser.username)
            await sendToClient2(self, socketsUsers[myUser.username], dataToSend)

        # HANDLE CHAT

        elif type == "MESSAGE":

            sender = data.get("sender")
            receiver = data.get("receiver")

            myUserSender = await getUserByUsername(sender.get("username"))
            myUserReceiver = await getUserByUsername(receiver.get("username"))

            dataToDb = Message(sender=myUserSender, receiver=myUserReceiver, message=data.get("message"))
            await saveMessage(dataToDb)
            await sendDiscussionToBothClient(self, myUserSender, myUserReceiver)



            


