from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from asgiref.sync import sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from users.serializers import UserSerializer, InvitationSerializer, FriendsListSerializer, MessageSerializer, RelationsBlockedSerializer, GameInvitationSerializer
from users.models import Invitation, User, FriendsList, Message, RelationsBlocked, GameInvitation
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
usersConnected = []

async def finalFriendsList(friendsList):
    size = len(friendsList)
    result = []
    i = 0
    while i < size:
        id = friendsList[i]
        myUser = await getUserById(id)
        result.append(myUser)
        i += 1
    return (result)


async def sendToEveryClientsUsersList(channel_layer):
    size = len(socketsUsers)
    i = 0
    usersConnected = list(socketsUsers.keys())
    sockets = list(socketsUsers.values())
    while i < size:
        myUser = await getUserById(usersConnected[i])
        myUsersList, myFriendsList, blockedUsers = await getFinalUsersListAndFriendsList(myUser)
        
        dataToSend = {
            "AllUsers": myUsersList
        }

        friendsToSend = {
            "friends": myFriendsList
        }
        await sendToClient(channel_layer, sockets[i], friendsToSend)
        await sendToClient(channel_layer, sockets[i], dataToSend)
        i += 1

# UTILS FUNCTIONS FOR THE WAITINGINVITATIONS

async def getUserByIdClean(myId):
    userTmp = await sync_to_async(User.objects.get)(id=myId)
    userSer = UserSerializer(userTmp)
    return userSer.data


async def getUserById(myId):
    return await sync_to_async(User.objects.get)(id=myId)


async def getAllUsers():
    allUsersTmp = await sync_to_async(list)(User.objects.all())
    allUsersSerializer = UserSerializer(allUsersTmp, many=True)
    allUsers = allUsersSerializer.data

    return allUsers

async def saveInvitation(myInvitation):
    await sync_to_async(myInvitation.save)()

async def saveMessage(myMessage):
    await sync_to_async(myMessage.save)()

async def saveRelationship(myFriendsList):
    await sync_to_async(myFriendsList.save)()

async def saveBlockedRelation(blockedRelation):
    await sync_to_async(blockedRelation.save)()

async def saveGameInvitation(gameInvitation):
    await sync_to_async(gameInvitation.save)()

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

async def eraseFriendRelationShip(parse_value):
    key1, key2 = parse_value.split("|", 1)
    other_value = key2 + "|" + key1
    try:
        myInvitation = await sync_to_async(FriendsList.objects.get)(parse=parse_value)
        await sync_to_async(myInvitation.delete)()
    except:
        myInvitation = await sync_to_async(FriendsList.objects.get)(parse=other_value)
        await sync_to_async(myInvitation.delete)()
        pass

async def eraseBlockedRelationShip(myUser, myUserBlocked):
    try:
        myRelation = await sync_to_async(RelationsBlocked.objects.get)(userWhoBlocks=myUser, userBlocked=myUserBlocked)
        await sync_to_async(myRelation.delete)()
    except:
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


async def getFriendsListById(myId):
    user = await sync_to_async(User.objects.get)(id=myId)
    friends_relationships = await sync_to_async(lambda: list(
        FriendsList.objects.filter(Q(user1=user) | Q(user2=user))
    ))()
    
    return friends_relationships

async def getRelationsBlocked(myUser):
    relationsBlockedTmp = await sync_to_async(lambda: list(
        RelationsBlocked.objects.filter(Q(userWhoBlocks=myUser) | Q(userBlocked=myUser))
    ))()
    relationsBlockedSerializer = RelationsBlockedSerializer(relationsBlockedTmp, many=True)
    relationsBlocked = relationsBlockedSerializer.data
    
    return relationsBlocked

async def getGameInvitation(myUser):
    gameInvitationsTmp = await sync_to_async(lambda: list(
        GameInvitation.objects.filter(userInvited=myUser)
    ))()
    gameInvitationSerializer = RelationsBlockedSerializer(gameInvitationsTmp, many=True)
    gameInvitation = gameInvitationSerializer.data
    
    return gameInvitation

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


async def usersListWithoutFriends(friendsList, AllUsers, id): 
    allFriendsName = []
    size = len(friendsList)
    i = 0
    while i < size:
            allFriendsName.append(friendsList[i].get("id"))
            i += 1

    allUsersnames = []
    size = len(AllUsers)
    i = 0
    while i < size:
        allUsersnames.append(AllUsers[i].get("id"))
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
        myUser = await getUserById(result[i])
        userResult.append(myUser)
        i += 1
    
    finalUserResult = UserSerializer(userResult, many=True)
    return finalUserResult.data


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

async def sendToClient2(self, message, id):
    if id in socketsUsers:
        socket = socketsUsers.get(id)
        await self.channel_layer.send(socket, {
            "type": "notification_to_client",
            "message": message,
        })

async def sendToSocket(self, socket, message):
    await self.channel_layer.send(socket, {
        "type": "notification_to_client",
        "message": message,
    })


async def getFriendsInvitations(id):
    result = []

    myUser = await getUserById(id)
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

async def getGamesInvitations(id):
    result = []

    myUser = await getUserById(id)
    id = myUser.id

    allInvitationsTmp = await sync_to_async(list)(GameInvitation.objects.filter(userInvited=id))

    allInvitations = await sync_to_async(GameInvitationSerializer)(allInvitationsTmp, many=True)

    for invitation in allInvitations.data:
        idInvitation = invitation.get("userInvited")
        if idInvitation == id:
            userToAddTmp = await getUserById(invitation.get("leader"))
            userToAdd = await sync_to_async(UserSerializer)(userToAddTmp)
            result.append(userToAdd.data)

    dataToSend = {
        "gamesInvitations": result
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

    userOneId = str(userOne.id)
    if userOneId in socketsUsers:
        await sendToClient2(self, dataToSend, userOneId)
    
    userTwoId = str(userTwo.id)
    if userTwoId in socketsUsers:
        await sendToClient2(self, dataToSend, userTwoId)


async def changeUserStatus(key, isConnected: bool):
    usersStatus[key] = isConnected

async def addToPool(key, value):
    async with pool_lock:
        usersPool[key.id] = value

async def getFromPool(key):
    async with pool_lock:
        return usersPool.get(key.id, None)

async def removeFromPool(key):
    async with pool_lock:
        usersPool.pop(key.id, None)

async def update_user_status(user, status):
    user.status = status
    await sync_to_async(user.save)()

async def sendToClient(channel_layer, socket, message):
    await channel_layer.send(socket, {
        "type": "notif",
        "message": message,
    })


async def findGameInvitationToErase(myUser):
    try:
        myGameInvitation = await sync_to_async(GameInvitation.objects.get)(leader=myUser)
        myGameInvitationSer = GameInvitationSerializer(myGameInvitation)
        myGame = myGameInvitationSer.data
        userToNotifID = myGame.get("userInvited")
        
        await sync_to_async(myGameInvitation.delete)()
        
        return userToNotifID
    
    except GameInvitation.DoesNotExist:
        return None



async def sendToShareSocket(self, message):
    await self.channel_layer.group_send("shareSocket", {
        "type": "shareSocket",
        "message": message,
    })

async def sendToSocketTournament(self, message):
    await self.channel_layer.group_send("socketTournament", {
        "type": "socketTournament",
        "message": message,
    })

def checkIfUserIsAlreadyConnected(myUser):
    myLen = len(usersConnected)
    i = 0
    while i < myLen:
        myInfo = usersConnected[i]
        id = myInfo.get("id")
        socket = myInfo.get("socket")
        if id == myUser.id:
            del usersConnected[i]
            return True, socket
        i += 1
    return False, None

def removeSocketObjet(myUser):
    myLen = len(usersConnected)
    i = 0
    while i < myLen:
        myInfo = usersConnected[i]
        id = myInfo.get("id")
        if id == myUser.id:
            del usersConnected[i]
            myLen -= 1
        i += 1
    return


class handleSocketConsumer(AsyncWebsocketConsumer):

    async def notification_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    async def socketTournament(self, event):
        data = event['message']
        # type = data.get("type")

    async def shareSocket(self, event):
        data = event['message']
        type = data.get("type")
        myUser = self.scope["user"]
        if type == "ABORT-MATCH":
            abortedId = data.get("userAborted")
            userAborted = await getUserById(abortedId)

            userToNotifID = await findGameInvitationToErase(userAborted)
            if userToNotifID == None:
                return
            gamesInvitations = await getGamesInvitations(userToNotifID)
            await sendToClient2(self, gamesInvitations, str(userToNotifID))

        elif type == "USERS-STATUS-INGAME":
            statusReceived = data["status"]
            for key in statusReceived:
                usersStatus[key] = "in-game"
                userToChange = await getUserById(key)
            await self.send_status_to_all()
            await update_user_status(userToChange, "in-game")


        elif type == "USERS-STATUS-OUTGAME":
            statusReceived = data["status"]
            for key in statusReceived:
                usersStatus[key] = True
            await self.send_status_to_all()
            await update_user_status(myUser, "online")


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
            myUser = self.scope["user"]
            userId = str(myUser.id)

            await self.accept()
            await self.channel_layer.group_add("notification", self.channel_name)
            await self.channel_layer.group_add("invitations", self.channel_name)
            await self.channel_layer.group_add("status_updates", self.channel_name)
            await self.channel_layer.group_add("shareSocket", self.channel_name)
            await self.channel_layer.group_add("socketTournament", self.channel_name)

            mySocket = self.channel_name
            myUser = self.scope['user']

            idUser = str(myUser.id)
            socketsUsers[idUser] = mySocket

            userInfo = {
                "socket": self.channel_name,
                "id": myUser.id
            }


            condition, socketUserAlreadyConnected = checkIfUserIsAlreadyConnected(myUser)
            if condition == True:
                dataToSend = {
                    "DEGAGE-FILS-DE-PUTE": "OH OUI"
                }
                await sendToSocket(self, socketUserAlreadyConnected, dataToSend)
                await sendToSocket(self, self.channel_name, dataToSend)
                self.close()
                return

            await addToPool(myUser, self.channel_name)
            await changeUserStatus(idUser, True)

            usersConnected.append(userInfo)
            logger.info("usersConnected --> %s", usersConnected)

            await self.send_status_to_all()
            await update_user_status(myUser, "online")
            await sendToEveryClientsUsersList(self.channel_layer)
        else:
            await self.close()


    ## DISCONNECT ##


    async def disconnect(self, close_code):
        myUser = self.scope['user']
        if myUser.is_authenticated:
            if myUser.id in socketsUsers:
                del socketsUsers[myUser.id]
            pass
            
            myUser = await getUserById(myUser.id)

            userId = str(myUser.id)
            await removeFromPool(myUser)
            await changeUserStatus(userId, False)
            await self.channel_layer.group_discard("status_updates", self.channel_name)
            removeSocketObjet(myUser)
            await self.send_status_to_all()
            socketsUsers.pop(userId, None)
            await update_user_status(myUser, "offline")
        else:
            await self.close()

    

    ## RECEIVE ##


    async def receive(self, text_data):

        data = json.loads(text_data)

        type = data["type"]
        myUser = self.scope["user"]
        if (type == "INVITE"):
            myReceiverId = data.get('to')
            typeMessage = data.get('type')
            parse = data.get('parse')

            myExpeditor = self.scope['user']
            myReceiver = await getUserById(myReceiverId)

            myInvitation = Invitation(expeditor=myExpeditor, receiver=myReceiver, message=typeMessage, parse=parse)
            invitation_exists = await checkInvitation(parse)

            if (invitation_exists == "FRIENDS NOW"): # USERS FRIENDS

                friendsList = FriendsList(user1=myExpeditor, user2=myReceiver, parse=parse)
                await saveRelationship(friendsList)
                await eraseInvitation(parse)
                await sendToBothClientUsersAndFriendsListAndBlocked(self, myExpeditor, myReceiver)


                friendsInvitationsToReceiver = await getFriendsInvitations(myReceiver.id)
                await sendToClient2(self, friendsInvitationsToReceiver, str(myReceiverId))

                friendsInvitationsToExpeditor = await getFriendsInvitations(myExpeditor.id)
                await self.send(text_data=json.dumps(friendsInvitationsToExpeditor))                

            elif (invitation_exists == "ALREADY FRIENDS"):
                return
            elif invitation_exists == True:
                return
            else:
                await saveInvitation(myInvitation)

                userReceiverId = data["to"]

                dataToSend = await getFriendsInvitations(userReceiverId)
                await sendToClient2(self, dataToSend, str(userReceiverId))

        elif type == "DELETE":
            stringRelation = data["parse"]
            myUser = self.scope["user"]
            userDeleted = await getUserById(data["userDeleted"])

            await deleteRelationShip(stringRelation)
            await sendToBothClientUsersAndFriendsListAndBlocked(self, myUser, userDeleted)


        elif type == "DECLINE":
            parse = data.get("parse")
            await eraseInvitation(parse)
            dataToSend = await getFriendsInvitations(myUser.id)
            await sendToClient2(self, dataToSend, str(myUser.id))

        # HANDLE CHAT

        elif type == "MESSAGE":
        
            sender = data.get("sender")
            receiver = data.get("receiver")

            myUserSender = await getUserById(sender.get("id"))
            myUserReceiver = await getUserById(receiver.get("id"))

            dataToDb = Message(sender=myUserSender, receiver=myUserReceiver, message=data.get("message"))
            await saveMessage(dataToDb)
            await sendDiscussionToBothClient(self, myUserSender, myUserReceiver)
        
        elif type == "BLOCK":
            myUserTmp = data.get("userWhoBlocks")
            myUserBlockedTmp = data.get("userBlocked")

            myUser = await getUserById(myUserTmp.get("id"))
            myUserBlocked = await getUserById(myUserBlockedTmp.get("id"))

            try:
                myObj = RelationsBlocked(userWhoBlocks=myUser, userBlocked=myUserBlocked)
                await saveBlockedRelation(myObj)
                try:
                    param = str(myUser.id) + "|" + str(myUserBlocked.id)
                    theyAreFriend = await RelationshipIsExisting(param)
                    if theyAreFriend == True:
                        await eraseFriendRelationShip(param)
                except:
                    raise(Exception("PAS AMIS"))
            except:
                raise(Exception("BON"))
            await sendToBothClientUsersAndFriendsListAndBlocked(self, myUser, myUserBlocked)
        
        elif type == "UNBLOCK":
            myUserTmp = data.get("userWhoBlocks")
            myUserBlockedTmp = data.get("userBlocked")

            myUser = await getUserById(myUserTmp.get("id"))
            myUserBlocked = await getUserById(myUserBlockedTmp.get("id")) 
            await eraseBlockedRelationShip(myUser, myUserBlocked)
            myUserRelationsBlocked = await getRelationsBlocked(myUser)
            myUserBlockedRelationsBlocked = await getRelationsBlocked(myUser)

            dataToMyUser = {
                "blocked": myUserRelationsBlocked
            }


            dataToMyBlockedUser = {
                "blocked": myUserBlockedRelationsBlocked
            }


            await sendToClient2(self, dataToMyUser, myUser.username)
            await sendToClient2(self, dataToMyBlockedUser, myUserBlocked.username)
            await sendToBothClientUsersAndFriendsListAndBlocked(self, myUser, myUserBlocked)
        
        elif type == "GameInvitation":
            userInvitedTmp = data.get("userInvited")
            myUserInvitedId = userInvitedTmp.get("id")
            myUserInvited = await getUserById(myUserInvitedId)
            myRoomId = data.get("roomId")
            stringParse = str(myUser.id) + "|" + str(myUserInvitedId)
            
            try:
                gameInvitation = GameInvitation(leader=myUser, userInvited=myUserInvited, roomId=myRoomId)
                await saveGameInvitation(gameInvitation)
                gameInvitation = await getGamesInvitations(myUserInvited.id)
                dataToSend = {
		        "type": "CHECK-GAME-INVITATION",
		        "users": stringParse
	            }
                await sendToShareSocket(self, dataToSend)
                await sendToClient2(self, gameInvitation, str(myUserInvitedId))
                
            except:
                raise (Exception("MOUAIS"))
        elif type == "ACCEPT-GameInvitation":
            userWhoInvites = data.get("userWhoInvites")
            myUserWhoInvitedID = userWhoInvites.get("id")
            myUserWhoInvites = await getUserById(myUserWhoInvitedID)
            try:
                myGameInvitation = await sync_to_async(GameInvitation.objects.get)(leader=myUserWhoInvites)
                myGameInvitationSer = GameInvitationSerializer(myGameInvitation)
                myGame = myGameInvitationSer.data
                roomId = myGame["roomId"]
                await findGameInvitationToErase(myUserWhoInvites)
                gamesInvitations = await getGamesInvitations(myUser.id)
                dataToSend = {
                    "acceptGameInvitation": roomId
                }

                userId = str(myUser.id)
                await sendToClient2(self, dataToSend, userId)
                await sendToClient2(self, gamesInvitations, userId)
            except:
                raise (Exception("MOUAIS"))
        elif type == "DECLINE-GameInvitation":
            userWhoInvitesId = data.get("userWhoInvites")
            userWhoDeclinesId = data.get("userWhoDeclines")

            userWhoInvites = await getUserById(userWhoInvitesId)
            userWhoDeclines = await getUserById(userWhoDeclinesId)
            try:
                myGameInvitation = await sync_to_async(GameInvitation.objects.get)(leader=userWhoInvites)
                myGameInvitationSer = GameInvitationSerializer(myGameInvitation)
                myGame = myGameInvitationSer.data
                await findGameInvitationToErase(userWhoInvites)
                gamesInvitations = await getGamesInvitations(userWhoDeclines.id)
                await sendToClient2(self, gamesInvitations, str(userWhoDeclinesId))
            except:
                raise (Exception("MOUAIS"))

        elif type == "CREATE-TOURNAMENT":
            await sendToSocketTournament(self, "oui")


async def sendToBothClientUsersAndFriendsListAndBlocked(self, myUser, secondUser):
    myUserUsersList, myUserFriendsList, userRelationsBlocked = await getFinalUsersListAndFriendsList(myUser)
    myUserBlockedUsersList, myUserBlockedFriendsList, secondUserRelationsBlocked = await getFinalUsersListAndFriendsList(secondUser)

    friendsListToMyUser = {
        "friends": myUserFriendsList
    }

    friendsListToMyBlockedUser = {
        "friends": myUserBlockedFriendsList
    }

    usersListToMyUser = {
        "AllUsers": myUserUsersList
    }

    usersListToMyBlockedUser = {
        "AllUsers": myUserBlockedUsersList
    }

    userBlockedRelationsToSend = {
        "blocked": userRelationsBlocked
    }

    secondUserBlockedRelationsToSend = {
        "blocked": secondUserRelationsBlocked
    }

    await sendToClient2(self, friendsListToMyUser, str(myUser.id))
    await sendToClient2(self, usersListToMyUser, str(myUser.id))
    await sendToClient2(self, friendsListToMyBlockedUser, str(secondUser.id))
    await sendToClient2(self, usersListToMyBlockedUser, str(secondUser.id))

    await sendToClient2(self, userBlockedRelationsToSend, str(myUser.id))
    await sendToClient2(self, secondUserBlockedRelationsToSend, str(secondUser.id))



def removeUsernameFromList(usernamesToRemove, myList):
    myLenList = len(myList)
    myLenUsernames = len(usernamesToRemove)
    i = 0
    while i < myLenUsernames:
        username = usernamesToRemove[i]
        j = 0
        while j < myLenList:
            if (username == myList[j].get("username")):
                myLenList -= 1
                del myList[j]
            j += 1
        i += 1
    return myList



async def getUsersList(myUser):
    friendsList = await getFriendsList(myUser)
    allUsers = await getAllUsers()

    lenAllUsers = len(allUsers)
    lenFriendsList = len(friendsList)
    i = 0

    # remove user

    while i < lenAllUsers:
        if (allUsers[i].get("username") == myUser.username):
            lenAllUsers -= 1
            del allUsers[i]
        i += 1
    # remove user's friends baby

    i = 0
    while i < lenFriendsList:
        theFriend = friendsList[i].get("username")
        j = 0
        while j < lenAllUsers:
            theUser = allUsers[j].get("username")
            if (theUser == theFriend):
                lenAllUsers -= 1
                del allUsers[j]
                break
            j += 1
        i += 1

    return allUsers

async def getFriendsList(myUser):
    friendsListTmp = await getFriendsListById(myUser.id)
    friendsListSer = FriendsListSerializer(friendsListTmp, many=True)
    friendsList = friendsListSer.data

    result = []
    myLen = len(friendsList)
    i = 0
    while i < myLen:
        userOneID = friendsList[i].get("user1")
        userTwoID = friendsList[i].get("user2")
        if myUser.id == userOneID:
            myUserToAddTmp = await getUserById(userTwoID)
            myUserToAddSerial = UserSerializer(myUserToAddTmp)
            myUserToAdd = myUserToAddSerial.data
            result.append(myUserToAdd)
        elif myUser.id == userTwoID:
            myUserToAddTmp = await getUserById(userOneID)
            myUserToAddSerial = UserSerializer(myUserToAddTmp)
            myUserToAdd = myUserToAddSerial.data
            result.append(myUserToAdd)
        i += 1

    return result




async def getFinalUsersListAndFriendsList(myUser):

    usersList = await getUsersList(myUser)
    friendsList = await getFriendsList(myUser)

    relationsBlocked = await getRelationsBlocked(myUser)

    # MERGE BLOCKEDS USERS INTO FRIENDS / USERSLIST

    myLen = len(relationsBlocked)
    i = 0
    usersBlocked = []
    usersToRemove = []
    while i < myLen:
        userBlocked = relationsBlocked[i]["userBlocked"]
        userWhoBlocks = relationsBlocked[i]["userWhoBlocks"]
        if myUser.id == userBlocked:
            userToRemove = await getUserById(userWhoBlocks)
            test = UserSerializer(userToRemove)
            usersBlocked.append(test.data)
            usersToRemove.append(userToRemove.username)
        elif myUser.id == userWhoBlocks:
            userToRemove = await getUserById(userBlocked)
            test = UserSerializer(userToRemove)
            usersBlocked.append(test.data)
            usersToRemove.append(userToRemove.username)
        i += 1


    usersList = removeUsernameFromList(usersToRemove, usersList)
    friendsList = removeUsernameFromList(usersToRemove, friendsList)

    return usersList, friendsList, usersBlocked


            


