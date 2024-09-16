from rest_framework.decorators import api_view
from users.models import User, FriendsList
from users.serializers import UserSerializer, FriendsListSerializer
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

def getAllUsers(request):
    payload = middleWareAuthentication(request)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)


def getFriendsList(request):
    payload = middleWareAuthentication(request)
    myFriendsList = FriendsList.objects.filter(id = payload['id']).first()
    serializer = FriendsListSerializer(myFriendsList, many=True)
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