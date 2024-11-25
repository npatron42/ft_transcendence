import shutil
import json
from pongMulti.models import MatchHistory
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.db import transaction
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.db.models import Q
from users.models import User, FriendsList, Invitation, Message, RelationsBlocked, GameInvitation, GameSettings
from users.serializers import UserSerializer, FriendsListSerializer, InvitationSerializer, MessageSerializer, RelationsBlockedSerializer, GameInvitationSerializer, GameSettingsSerializer
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
import random

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

def getUserByUsername(request, username):
    user = User.objects.get(username=username)
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data)

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




def getMatchHistoryByUsername(request, username):
    myUser = User.objects.filter(username=username).first()

    matchesTmp = MatchHistory.objects.filter(Q(player1=myUser) | Q(player2=myUser))
    matchesSer = MatchHistorySerializer(matchesTmp, many=True)
    matches = matchesSer.data

    i = 0
    myLen = len(matches)
    result = []
    while i < myLen:
        if myUser.id == matches[i]["player1"]:
            opponent = getUserById(matches[i]["player2"])
            score = str(matches[i]["player1_score"]) + "  /  " + str(matches[i]["player2_score"])
        else:
            opponent = getUserById(matches[i]["player1"])
            score = str(matches[i]["player2_score"]) + "  /  " + str(matches[i]["player1_score"])
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

def getUserFriendsListById(request, id):
    myUser = User.objects.filter(id=id).first()
    if not myUser:
        return JsonResponse({"error": "User not found"}, status=404)

    friendsRelationships = FriendsList.objects.filter(Q(user1=myUser) | Q(user2=myUser))
    tabFriends = []
    for relationship in friendsRelationships:
        userToAdd = UserSerializer(relationship.user2 if relationship.user1 == myUser else relationship.user1)
        tabFriends.append(userToAdd.data)

    usernamesBlocked = getUsernamesBlocked(request)
    tabFriends = removeUsernameFromList(usernamesBlocked, tabFriends)

    return JsonResponse(tabFriends, safe=False)



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
        return JsonResponse({'success': False})
    

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
        return JsonResponse({'success': False})
    

    user.email = mail
    user.save()
    return JsonResponse({'success': True})

@csrf_exempt  
def checkPass(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    password = data.get('pass')
    

    if (password==user.password):
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
        return JsonResponse({'success': False})
    

    user.password = password
    user.save()
    return JsonResponse({'success': True})

@csrf_exempt  
def toggle2fa(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    data = json.loads(request.body)
    user.dauth = data.get('dauth')
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


##RGPD


@csrf_exempt  
def deleteProfile(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    while True:
        random_number = random.randint(10000, 99999)
        name = f"user_{random_number}"
        email = f"{name}@delete"
        if not user.isFrom42 :
            password = f"{random_number}"
        if not User.objects.filter(username=name).exists():
            break
    user.sup = True
    user.username = name
    user.profilePicture = 'default.jpg'
    if not user.isFrom42 :
        user.password = password
    user.email = email
    user.save()
    return JsonResponse({'success': True})


@csrf_exempt  
def exportProfile(request):
    
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    
    
    user_data = {
        "username": user.username,
        "email": user.email,
        "status": user.status,
        "profilePicture": user.profilePicture,
        "isFrom42": user.isFrom42,
        "myid42": user.myid42,
        "langue": user.langue,
        "dauth": user.dauth,
        "otp_code": user.otp_code,
        "otp_created_at": user.otp_created_at,
        "delete_profile" : user.sup
    }

    invitations_sent = list(Invitation.objects.filter(expeditor=user).values())
    invitations_received = list(Invitation.objects.filter(receiver=user).values())
    
    friends = list(FriendsList.objects.filter(user1=user).values()) + list(FriendsList.objects.filter(user2=user).values())
    
    blocked = list(RelationsBlocked.objects.filter(userWhoBlocks=user).values())
    
    game_invitations = list(GameInvitation.objects.filter(leader=user).values()) + list(GameInvitation.objects.filter(userInvited=user).values())
    
    messages_sent = list(Message.objects.filter(sender=user).values())
    messages_received = list(Message.objects.filter(receiver=user).values())
    
    match_history = list(MatchHistory.objects.filter(Q(player1=user) | Q(player2=user)).values())

    full_data = {
        "profile": user_data,
        "invitations_sent": invitations_sent,
        "invitations_received": invitations_received,
        "friends": friends,
        "blocked_users": blocked,
        "game_invitations": game_invitations,
        "messages_sent": messages_sent,
        "messages_received": messages_received,
        "match_history": match_history,
    }

    return JsonResponse(full_data, json_dumps_params={'indent': 2})



def getGameSettings(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    gameSettings = GameSettings.objects.filter(user=user).first()
    serializer = GameSettingsSerializer(gameSettings)
    return JsonResponse(serializer.data)

#cets de la merde ?? 
@csrf_exempt
def updateGameSettings(request):
    if request.method == 'POST':
        try:
            payload = middleWareAuthentication(request)
            user = User.objects.filter(id=payload['id']).first()

            gameSettings = GameSettings.objects.filter(user=user).first()

            data = json.loads(request.body)
            up = data.get('up')
            down = data.get('down')
            paddleSkin = data.get('paddleSkin')
            boardSkin = data.get('boardSkin')
            ballSkin = data.get('ballSkin')
            
            if gameSettings:
                gameSettings.up = up
                gameSettings.down = down
                gameSettings.paddleSkin = paddleSkin 
                gameSettings.boardSkin = boardSkin
                gameSettings.ballSkin = ballSkin

                gameSettings.save()

                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': 'Game settings not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)