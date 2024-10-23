from rest_framework.decorators import api_view
from django.db.models import Q
from users.models import User, FriendsList, Invitation, Message, RelationsBlocked, GameInvitation
from users.serializers import UserSerializer, FriendsListSerializer, InvitationSerializer, MessageSerializer, RelationsBlockedSerializer, GameInvitationSerializer
from django.http import JsonResponse
from .utils import middleWareAuthentication
from channels.db import database_sync_to_async
import jwt
import logging
import os

logger = logging.getLogger(__name__)



    ### USERS ###



def getUser(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data)

def getUserById(myId):

    user = User.objects.get(id=myId)
    serializer = UserSerializer(user)
    return serializer.data



    ### ALL USERS ###



def getAllUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)

def getAllUsers2(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return serializer.data



    ### NOTIFICATIONS ###



def getGamesInvitations(request):
    payload = middleWareAuthentication(request)

    result = []
    myUser = User.objects.filter(id = payload['id']).first()
    id = myUser.id

    allInvitationsTmp = GameInvitation.objects.all()
    allInvitations = GameInvitationSerializer(allInvitationsTmp, many=True)

    for invitation in allInvitations.data:
        idInvitation = invitation.get("userInvited")
        if (idInvitation == id):
            userToAdd = getUserById(invitation.get("leader"))
            result.append(userToAdd)

    return JsonResponse(result, safe=False)

def getFriendsInvitations(request):
    payload = middleWareAuthentication(request)

    result = []
    myUser = User.objects.filter(id = payload['id']).first()
    id = myUser.id

    allInvitationsTmp = Invitation.objects.all()
    allInvitations = InvitationSerializer(allInvitationsTmp, many=True)

    for invitation in allInvitations.data:
        idInvitation = invitation.get("receiver")
        if (idInvitation == id):
            userToAdd = getUserById(invitation.get("expeditor"))
            result.append(userToAdd)
    return JsonResponse(result, safe=False)



    ### BLOCKED USERS ###



def getUserBlockedRelations(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    relationsBlockedTmp = RelationsBlocked.objects.filter(userWhoBlocks=myUser)
    relationsBlockedSerial = RelationsBlockedSerializer(relationsBlockedTmp, many=True)
    relationsBlocked = relationsBlockedSerial.data

    i = 0
    relationsLen = len(relationsBlocked)
    result = []
    while i < relationsLen:
        userBlockedID = relationsBlocked[i].get("userBlocked")
        myUserToAddTmp =  getUserById(userBlockedID)
        myUserToAddSerial = UserSerializer(myUserToAddTmp)
        myUserToAdd = myUserToAddSerial.data
        result.append(myUserToAdd)            
        i += 1

    return JsonResponse(result, safe=False)


def getBlockedUsers(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    relationsBlockedTmp = RelationsBlocked.objects.filter(Q(userWhoBlocks=myUser) | Q(userBlocked=myUser))
    relationsBlockedSerial = RelationsBlockedSerializer(relationsBlockedTmp, many=True)
    relationsBlocked = relationsBlockedSerial.data

    i = 0
    relationsLen = len(relationsBlocked)
    result = []
    while i < relationsLen:
        userBlockedID = relationsBlocked[i].get("userBlocked")
        userWhoBlocksID = relationsBlocked[i].get("userWhoBlocks")
        if (myUser.id == userWhoBlocksID):
            myUserToAddTmp =  getUserById(userBlockedID)
            myUserToAddSerial = UserSerializer(myUserToAddTmp)
            myUserToAdd = myUserToAddSerial.data
            result.append(myUserToAdd)
        elif (myUser.id == userBlockedID):
            myUserToAddTmp =  getUserById(userWhoBlocksID)
            myUserToAddSerial = UserSerializer(myUserToAddTmp)
            myUserToAdd = myUserToAddSerial.data
            result.append(myUserToAdd)            
        i += 1

    return JsonResponse(result, safe=False)

def getBlockedUsers2(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    relationsBlockedTmp = RelationsBlocked.objects.filter(Q(userWhoBlocks=myUser) | Q(userBlocked=myUser))
    relationsBlockedSerial = RelationsBlockedSerializer(relationsBlockedTmp, many=True)
    relationsBlocked = relationsBlockedSerial.data

    i = 0
    relationsLen = len(relationsBlocked)
    result = []
    while i < relationsLen:
        userBlockedID = relationsBlocked[i].get("userBlocked")
        userWhoBlocksID = relationsBlocked[i].get("userWhoBlocks")
        if (myUser.id == userWhoBlocksID):
            myUserToAddTmp =  getUserById(userBlockedID)
            myUserToAddSerial = UserSerializer(myUserToAddTmp)
            myUserToAdd = myUserToAddSerial.data
            result.append(myUserToAdd)
        elif (myUser.id == userBlockedID):
            myUserToAddTmp =  getUserById(userWhoBlocksID)
            myUserToAddSerial = UserSerializer(myUserToAddTmp)
            myUserToAdd = myUserToAddSerial.data
            result.append(myUserToAdd)            
        i += 1

    return result


    ### DISCUSSIONS ###


def getDiscussions(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()
    
    idSelected = request.GET.get("selectedUser")
    myUserSelectedTmp = getUserById(idSelected)

    myUserSelected = User.objects.filter(id = myUserSelectedTmp.get("id")).first()

    discussionTmp = Message.objects.filter(
        (Q(sender=myUser) & Q(receiver=myUserSelected)) | 
        (Q(sender=myUserSelected) & Q(receiver=myUser))
    )

    discussion = MessageSerializer(discussionTmp, many=True)

    dataToSend = {
        "allDiscussion": discussion.data
    }
    return JsonResponse(dataToSend, safe=False)



        ### FRIENDS LIST ###



def getFriendsList(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    friendsRelationships = FriendsList.objects.filter(Q(user1=myUser) | Q(user2=myUser))
    tabFriends = []
    for relationship in friendsRelationships:
        if relationship.user1 == myUser:
            userToAdd = UserSerializer(relationship.user2)
            tabFriends.append(userToAdd.data)
        else:
            userToAdd = UserSerializer(relationship.user1)
            tabFriends.append(userToAdd.data)

    usernamesBlocked = getUsernamesBlocked(request)
    tabFriends = removeUsernameFromList(usernamesBlocked, tabFriends)

    return JsonResponse(tabFriends, safe=False)


def getFriendsList2(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    friendsRelationships = FriendsList.objects.filter(Q(user1=myUser) | Q(user2=myUser))
    tabFriends = []
    for relationship in friendsRelationships:
        if relationship.user1 == myUser:
            userToAdd = UserSerializer(relationship.user2)
            tabFriends.append(userToAdd.data)
        else:
            userToAdd = UserSerializer(relationship.user1)
            tabFriends.append(userToAdd.data)
    
    usernamesBlocked = getUsernamesBlocked(request)
    tabFriends = removeUsernameFromList(usernamesBlocked, tabFriends)
    
    return tabFriends


    ### JWT ###



async def getUserFromJWT(token):
    decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    user_id = decoded_token.get('id')
    try:
        user = await database_sync_to_async(User.objects.get)(id=user_id)
        return user
    except User.DoesNotExist:
        return None
    


    ### USERS LIST ###



def getUsersList(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()


    friendsList =  getFriendsList2(request)

    allUsers = getAllUsers2(request)

    lenAllUsers = len(allUsers)
    lenFriendsList = len(friendsList)
    i = 0


    while i < lenAllUsers:
        if (allUsers[i].get("username") == myUser.username):
            lenAllUsers -= 1
            del allUsers[i]
        i += 1

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
    
    usernamesBlocked = getUsernamesBlocked(request)
    allUsers = removeUsernameFromList(usernamesBlocked, allUsers)

    return JsonResponse(allUsers, safe=False)



    ### INVITATIONS ###


def postInvite(request):
    payload = middleWareAuthentication(request)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)





    ### UTILS FUNCTIONS ###


def getUsernamesBlocked(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    usersBlocked = getBlockedUsers2(request)
    myLen = len(usersBlocked)
    i = 0
    usernames = []
    while i < myLen:
        username = usersBlocked[i].get("username")
        usernames.append(username)
        i += 1
    return usernames


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





