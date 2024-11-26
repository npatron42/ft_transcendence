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
import string
import re

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
		return None
	try:
		payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
		isTokenExpired(payload)
		
	except:
		return None
	return payload

def checkValidUsername(username):
	username_regex = r'^[a-zA-Z0-9.-]{3,11}$'
	
	if not username:
		return False
	
	if not re.match(username_regex, username):
		return False
	
	if User.objects.filter(username=username).exists():
		return False
	
	return True

def checkValidEmail(email):
	email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
	
	if not email:
		return False
	
	if not re.match(email_regex, email):
		return False
	
	if User.objects.filter(email=email).exists():
		return 'False'
	
	return True

def checkValidPassword(password):
	password_regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-=~.])[A-Za-z\d@$!%*?&#^_\-=~.]{8,40}$'
	
	if not password:
		return False
	
	if not re.match(password_regex, password):
		return False
	
	return  True

def checkValidGameSettings(data):
	
	up = data.get('up')
	down = data.get('down')
	paddleSkin = data.get('paddleSkin')
	boardSkin = data.get('boardSkin')
	ballSkin = data.get('ballSkin')

	if not up or not down or not paddleSkin or not boardSkin or not ballSkin:
		return False

	allowed_keys = string.ascii_lowercase + string.digits + string.ascii_uppercase + 'ArrowUp' + 'ArrowDown' + 'ArrowLeft' + 'ArrowRight'
	if up not in allowed_keys or down not in allowed_keys or up == down or (len(up) != 1 and up not in ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) or (len(down) != 1 and down not in ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']):
		return False

	if paddleSkin not in ['defaultPaddle', 'radientPaddle', 'neonPaddle', 'redPaddle', 'glassPaddle', 'firePaddle']:
		return False
	
	if ballSkin not in ['defaultBall', 'radientBall', 'neonBall', 'oldBall', 'pingPongBall', 'glassBall']:
		return False
  
	if boardSkin not in ['defaultBoard', 'oldBoard', 'pingPongBoard', 'npatronBoard', 'galaxyBoard', 'retroGridBoard', 'gradientBoard', 'ballBoard', 'ball2Board']:
		return False
 
	return True
