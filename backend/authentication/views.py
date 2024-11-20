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
from django.core.cache import cache
from django.core.mail import send_mail
import json
import random
import string
from django.utils import timezone
from datetime import timedelta


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

            user = User.objects.get(username=username)
            
            if user.dauth:

                user.otp_code = ''.join(random.choices(string.digits, k=6))
                user.otp_created_at = timezone.now()
                user.save()

                send_mail(
                    f'Ft_TRANSCENDANCE = {user.username}',
                    f'--------> {user.otp_code}',
                    'ft.transcendence.42nice@gmail.com',
                    [user.email],
                    fail_silently=False,
                )

                return JsonResponse({
                    'success': True,
                    'message': f'You are connected, {user.username}',
                })
            else :
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
                
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        user = get_user_model()

        if user.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'username': False,
                'email': True
            })

        if user.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'username': True,
                'email': False
            })

        user = user.objects.create_user(username=username, email=email, password=password)

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


@csrf_exempt
def verify_otp(request):
    data = json.loads(request.body)
    username = data.get('username')
    otp_code = data.get('otp') 
    
    user = User.objects.get(username=username)

    is_otp_valid = user.otp_code == otp_code
    otp_expiration_time = user.otp_created_at + timedelta(minutes=5)
    is_otp_not_expired = timezone.now() < otp_expiration_time

    if is_otp_valid and is_otp_not_expired:
        user.otp_code = ''
        user.otp_created_at = None
        user.save()

        token = attributeToUserJWT(user)

        return JsonResponse({
            'success': True,
            'message': f'Vous êtes connecté, {user.username}',
            'token': token.data['jwt'],
        })
    else:
        if is_otp_not_expired:
            return JsonResponse({'success': False })
        else :
            return JsonResponse({'success': False, 'noValid': True})