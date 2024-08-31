import logging
import jwt, datetime
from users.models import User
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView

logger = logging.getLogger(__name__)
class AuthenticationView(APIView):

	def get(self, request):
		token = request.COOKIES.get('jwt')

		if not token:
			raise(AuthenticationFailed)
		return Response({"token": token})

def	generateTokenJWT(id):


	myPayload = {
		'id': id,
		'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
		'iat': datetime.datetime.utcnow()
	}
	token = jwt.encode(myPayload, 'secret', algorithm='HS256')
	return (token)

