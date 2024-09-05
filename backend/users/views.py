from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from .utils import middleWareAuthentication
from channels.db import database_sync_to_async
import jwt, datetime
import logging
import os

logger = logging.getLogger(__name__)


def getUser(request):

	payload = middleWareAuthentication(request)
	user = User.objects.filter(id = payload['id']).first()
	serializer = UserSerializer(user)
	return JsonResponse(serializer.data)


async def getUserFromJWT(token):
    # Décodage du jeton
    decoded_token = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    user_id = decoded_token.get('id')
    try:
        user = await database_sync_to_async(User.objects.get)(id=user_id)
        return user
    except User.DoesNotExist:
        return None
