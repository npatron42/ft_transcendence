from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer

@api_view(['GET'])
def getUser(request):
    return Response(UserSerializer({"username": "Nico", "password": "mypassword", 
                                    "email": "test", "date_subscription": "oui", 
                                    "date_lastvisit": "non",}).data)

@api_view(['POST'])
def createUser(request):
    myUser = UserSerializer(data=request.data)
    if myUser.is_valid():
        myUser.save()
        return Response(myUser.data, status=status.HTTP_201_CREATED)
    return Response(myUser.errors, status=status.HTTP_400_BAD_REQUEST)