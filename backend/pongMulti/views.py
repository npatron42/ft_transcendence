from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Room
from django.contrib.auth import get_user_model

user = get_user_model()

class createRoom(APIView):
    def post(self, request):
        print("test")
        player1 = request.user
