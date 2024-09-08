from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
import jwt, datetime
import logging
import os

logger = logging.getLogger(__name__)

def	isTokenExpired(payload):
	str_exp = payload["exp"]
	str_iat = payload["iat"]
	int_exp = int(str_exp)
	int_iat = int(str_iat)
	if ((int_exp - int_iat) <= 0):
		raise(AuthenticationFailed("JWT Token expired"))
	return

def middleWareAuthentication(request):
	auth_header = request.headers.get('Authorization')
	token = auth_header.split(' ')[1]
	if not token:
		raise AuthenticationFailed('No existing token')
	try:
		payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
		logger.info(payload)
		isTokenExpired(payload)
		
	except:
		jwt.ExpiredSignatureError
		raise AuthenticationFailed('Unauthenticated')
	return payload
