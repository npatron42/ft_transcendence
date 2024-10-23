import shutil
from django.db import transaction
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.db.models import Q
from users.models import User, FriendsList, Invitation
from users.serializers import UserSerializer, FriendsListSerializer, InvitationSerializer
from django.http import JsonResponse
from .utils import middleWareAuthentication
from channels.db import database_sync_to_async
from django.views.decorators.cache import cache_control
from django.core.files.storage import FileSystemStorage
import jwt
import logging
import os

logger = logging.getLogger(__name__)

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

def getAllUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)

def getAllNotifs(request):
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
    waitingFabioPart = []
    dataToSend = {
        "friendsInvitations": result,
        "gameInvitations": waitingFabioPart

    }
    return JsonResponse(dataToSend, safe=False)


# FRIENDS LIST 

def getFriendsFromUser(user):
    friendsRelationships = FriendsList.objects.filter(Q(user1=user) | Q(user2=user))
    tabFriends = []
    for relationship in friendsRelationships:
        if relationship.user1 == user:
            tabFriends.append(relationship.user2)
        else:
            tabFriends.append(relationship.user1)
    
    return tabFriends


def getFriendsList(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()

    myFriendsList = getFriendsFromUser(user)
    serializer = UserSerializer(myFriendsList, many=True)
    return JsonResponse(serializer.data, safe=False)


async def getUserFromJWT(token):
    decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    user_id = decoded_token.get('id')
    try:
        user = await database_sync_to_async(User.objects.get)(id=user_id)
        return user
    except User.DoesNotExist:
        return None
    

def postInvite(request):
    payload = middleWareAuthentication(request)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)


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
    
