from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from users.serializers import UserSerializer
import jwt, datetime