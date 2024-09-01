from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
import jwt, datetime
import logging
logger = logging.getLogger(__name__)


class UserView(APIView):
	def get(request):
		token = request.COOKIES.get("jwt")
		if not token:
			raise AuthenticationFailed('Unauthenticated')
		try:
			payload = jwt.decode(token, 'secret', algorithms=['HS256'])
		except:
			jwt.ExpiredSignatureError
			raise AuthenticationFailed('Unauthenticated')
		user = User.objects.filter(id = payload['id']).first()
		serializer = UserSerializer(user)
		return Response(serializer.data)
