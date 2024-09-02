from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from .utils import middleWareAuthentication
import jwt, datetime
import logging
import os

logger = logging.getLogger(__name__)


def getUser(request):

	payload = middleWareAuthentication(request)
	user = User.objects.filter(id = payload['id']).first()
	serializer = UserSerializer(user)
	return JsonResponse(serializer.data)
