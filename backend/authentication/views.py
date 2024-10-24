import logging
import jwt, datetime
from users.models import User
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from oauth.views import attributeToUserJWT
from django.contrib.auth import get_user_model
import json

logger = logging.getLogger(__name__)

#Auth 

@csrf_exempt
def loginPage(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
           
            token = attributeToUserJWT(user)

            return JsonResponse({
                'success': True,
                'message': f'You are connected, {user.username}',
                'token': token.data['jwt'],
            })

        else:
            return JsonResponse({'success': False, 'message': 'dommage mauvais id'})

    return JsonResponse({'success': False, 'message': 'Méthode non autorisée.'})




@csrf_exempt
def registerPage(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        logger.info(f'Received data: {data}')
                
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        user = get_user_model()

        if user.objects.filter(username=username).exists():
            logger.error(f'Username {username} already exists.')
            return JsonResponse({
                'success': False,
                'username': False,
                'email': True
            })

        if user.objects.filter(email=email).exists():
            logger.error(f'Email {email} already exists.')
            return JsonResponse({
                'success': False,
                'username': True,
                'email': False
            })

        user = user.objects.create_user(username=username, email=email, password=password)
        logger.info(f'User {username} created successfully.')

        return JsonResponse({
            'success': True,
            'username': True,
            'email': True,
            'user': {
                'username': user.username,
                'email': user.email,
            }
        })
    return JsonResponse({'success': False, 'message': 'Méthode non autorisée.'})
