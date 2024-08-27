from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer


@api_view(['GET'])
def getUsers(request):
	print("je passe par la")
	users = User.objects.all()
	serializer = UserSerializer(users, many=True)
	return Response(serializer.data)

@api_view(['POST'])
def createUser(request):
	serializer = UserSerializer(data=request.data)
	if (serializer.is_valid()):
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		