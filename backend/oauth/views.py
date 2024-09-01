from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect
from users.models import User
from rest_framework import status
from rest_framework.response import Response
from users.serializers import UserSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from django.http import HttpResponse
import jwt, datetime
import os
import requests
import logging
logger = logging.getLogger(__name__)

myId = "u-s4t2ud-833368055563188d4e7433e8ee83fe676656a831c2c0651ff295be883bde7122"
mySecret = "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"
url_42 = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-833368055563188d4e7433e8ee83fe676656a831c2c0651ff295be883bde7122&redirect_uri=http%3A%2F%2Flocalhost%3A5174%2Fhome&response_type=code"
myRedirect = "http://localhost:5173/home"

class OAuthView(APIView):
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error": "Code is required"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            access_token = giveMe42Token(code)
            myJson = doRequestTo42(access_token, "/v2/me")
            myUser = add42UserToDB(myJson)
            logger.info(myUser)
            response = attributeToUserJWT(myUser)
            logger.info(response)
            return response
        except Exception as e:
            return Response({"Error": "Failed during creation proccess, to DB"})




def giveMe42Token(code: str):
    data = {
        "grant_type": "authorization_code",
        "client_id": myId,
        "client_secret": mySecret,
        "code": code,
        "redirect_uri": myRedirect
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    response = requests.post("https://api.intra.42.fr/oauth/token", data=data, headers=headers)
    response_data = response.json()
    access_token = response_data.get("access_token")
    
    return access_token




def	doRequestTo42(access_token: str, endpoint: str):
    finalendpoint = "https://api.intra.42.fr" + endpoint
    response = requests.get(finalendpoint, headers={
        'Authorization': 'Bearer %s' % access_token
    })
    return response.json()




def add42UserToDB(jsonFile):
    login42 = jsonFile.get("login")
    email42 = jsonFile.get("email")
    picture = jsonFile.get("image", {}).get("link")
    bool42 = True

    data42 = {
        "username": login42 + "_42",
        "email": email42,
        "isFrom42": bool42,
        "profilePicture": picture
    }

    newUser42 = UserSerializer(data=data42)
    try:
        newUser42.is_valid()
        myReturnUser = newUser42.save()
        return myReturnUser
    except:
        raise(Exception("Cannot add User to DB"))
    



def attributeToUserJWT(myUser: User):
    userId = myUser.id
    logger.info(userId)
    myPayload = {
		'id': userId,
		'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=180),
		'iat': datetime.datetime.utcnow()
	}
    logger.info(os.getenv('SECRET_KEY'))
    token = jwt.encode(myPayload, os.getenv('SECRET_KEY'), algorithm='HS256')
    response = Response()
    response.set_cookie(key='jwt', value=token, httponly=True)
    response.data = {
        'jwt': token
    }
    return (response)


