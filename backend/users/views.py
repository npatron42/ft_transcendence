from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def getUsers(request):
	users = User.objects.all()
	serializer = UserSerializer(users, many=True)
	return Response(serializer.data)

# @api_view(['POST'])
# def createUser(request):
# 	# print("JE PASSE PAR ICI")
# 	# print(request.body)
# 	logger.info(request.data)
# 	return Response(request.data)

@api_view(['POST'])
def createUser(request):
	newUser = UserSerializer(data=request.data)
	if (newUser.is_valid()):
		newUser.save()
	return Response(newUser.data, status=status.HTTP_201_CREATED)
	# return Response(newUser.errors, status=status.HTTP_400_BAD_REQUEST)