from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Room
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateRoom(APIView):
    def post(self, request):
        player1 = request.user
        room = Room.objects.create(player1=player1)
        return Response({'room_id': room.id, 'message': 'Room created'}, status=status.HTTP_201_CREATED)

class JoinRoom(APIView):
    def post(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        if room.player2 is None:
            room.player2 = request.user
            room.save()
            return Response({'message': 'Player2 joined the room'}, status=status.HTTP_200_OK)
        return Response({'message': 'Room is full'}, status=status.HTTP_400_BAD_REQUEST)
