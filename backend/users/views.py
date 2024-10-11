from rest_framework.decorators import api_view
from django.db.models import Q
from users.models import User, FriendsList, Invitation, Message
from users.serializers import UserSerializer, FriendsListSerializer, InvitationSerializer, MessageSerializer
from django.http import JsonResponse
from .utils import middleWareAuthentication
from channels.db import database_sync_to_async
import jwt
import logging
import os

logger = logging.getLogger(__name__)


def getUser(request):
    payload = middleWareAuthentication(request)
    user = User.objects.filter(id = payload['id']).first()
    serializer = UserSerializer(user)
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



