import shutil
import json
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.db import transaction
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.db.models import Q
from users.models import User, FriendsList, Invitation, Message, RelationsBlocked, GameInvitation
from users.serializers import UserSerializer, FriendsListSerializer, InvitationSerializer, MessageSerializer, RelationsBlockedSerializer, GameInvitationSerializer
from django.http import JsonResponse
from pongMulti.models import MatchHistory
from pongMulti.serializers import MatchHistorySerializer
from .utils import middleWareAuthentication
from channels.db import database_sync_to_async
from django.views.decorators.cache import cache_control
from django.core.files.storage import FileSystemStorage
import jwt
import logging
import os

logger = logging.getLogger(__name__)



    ### USERS ###



def getUser(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    serializer = UserSerializer(user)
    logger.info(f"User data retrieved: {serializer.data}")
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


def getMatchHistory(request):
    payload = middleWareAuthentication(request)
    myUser = User.objects.filter(id = payload['id']).first()

    matchesTmp = MatchHistory.objects.filter(Q(player1=myUser) | Q(player2=myUser))
    matchesSer = MatchHistorySerializer(matchesTmp, many=True)
    matches = matchesSer.data

    i = 0
    myLen = len(matches)
    result = []
    while i < myLen:
        if myUser.id == matches[i]["player1"]:
            opponent = getUserById(matches[i]["player2"])
            score = str(matches[i]["player1_score"]) + "  -  " + str(matches[i]["player2_score"])
        else:
            opponent = getUserById(matches[i]["player1"])
            score = str(matches[i]["player2_score"]) + "  -  " + str(matches[i]["player1_score"])
        if myUser.id == matches[i]["winner"]:
            win = True
        else:
            win = False
        date = matches[i]["date"]
        dataToSend = {
            "opponent": opponent,
            "score": score,
            "win": win,
            "date": date
        }
        result.append(dataToSend)
        i += 1
    return JsonResponse(result, safe=False)


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


    ## PROFIL PAGE ## 


@csrf_exempt
def uploadProfilePicture(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()

    file = request.FILES['profilPicture']
    upload_directory = f'media/{user.id}/'

    if os.path.exists(upload_directory):
        shutil.rmtree(upload_directory)
        os.makedirs(upload_directory, exist_ok=True)
    else:
        os.makedirs(upload_directory, exist_ok=True)

    file_path = os.path.join(upload_directory, file.name)

    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    relative_path = f'{user.id}/{file.name}'
    user.profilePicture = relative_path
    user.save()

    return JsonResponse({"message": "Profile picture updated successfully", "path": relative_path})

@csrf_exempt  
def resetProfilePicture(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    upload_directory = f'media/{user.id}/'

    if os.path.exists(upload_directory):
        shutil.rmtree(upload_directory)

    user.profilePicture = 'default.jpg'
    user.save()
    return JsonResponse({'success': True})

@csrf_exempt  
def changeLangue(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    user.langue = data.get('langue')
    user.save()
    return JsonResponse({'success': True, 'langue': user.langue})

@csrf_exempt  
def changeName(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    name = data.get('name')
    

    if User.objects.filter(username=name).exists():
        logger.info("user exist")
        return JsonResponse({'success': False})
    

    logger.info("new user -------> ", user)
    user.username = name
    user.save()
    return JsonResponse({'success': True})

@csrf_exempt  
def changeMail(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    mail = data.get('mail')
    

    if User.objects.filter(email=mail).exists():
        logger.info("user exist")
        return JsonResponse({'success': False})
    

    logger.info("new mail -------> ", mail)
    user.email = mail
    user.save()
    return JsonResponse({'success': True})

@csrf_exempt  
def checkPass(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    password = data.get('pass')
    
    logger.info("mdp %s", user.password)
    logger.info("recu %s", password)

    if (password==user.password):
        logger.info("user exist")
        return JsonResponse({'success': True})
    else :
        return JsonResponse({'success': False})

@csrf_exempt  
def changePass(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    password = data.get('pass')
    

    if User.objects.filter(password=password).exists():
        logger.info("user exist")
        return JsonResponse({'success': False})
    
    logger.info("new pass -------> %s ", password)

    user.password = password
    user.save()
    return JsonResponse({'success': True})

@csrf_exempt  
def toggle2fa(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    user.dauth = data.get('dauth')
    logger.info("test-----> %s", user.dauth)
    user.save()
    return JsonResponse({'success': True, 'dauth': user.dauth})
    
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



