from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.shortcuts import redirect
from users.models import User
from users.serializers import UserSerializer
import requests
import logging

logger = logging.getLogger(__name__)

myId = "u-s4t2ud-833368055563188d4e7433e8ee83fe676656a831c2c0651ff295be883bde7122"
mySecret = "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"
url_42 = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-833368055563188d4e7433e8ee83fe676656a831c2c0651ff295be883bde7122&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Foauth2%2Flogin%2Fredirect&response_type=code"
myRedirect = "http://localhost:8000/oauth2/login/redirect"

def	loginOAuth(request: HttpRequest):
	print('test')
	return redirect(url_42)

def loginOAuthRedirect(request: HttpRequest):
	code = request.GET.get('code')
	access_token = giveMeToken(code)
	myJson = doRequestTo42(access_token, "/v2/me")
	if add42UserToDB(myJson) == True:
				return JsonResponse({"ADDED TO": "db"})
	return JsonResponse(myJson)


def giveMeToken(code: str):
	data = {
		"grant_type": "authorization_code",
		"client_id": myId,
		"client_secret": mySecret,
		"code": code,
		"redirect_uri": myRedirect
	}
	response = requests.post("https://api.intra.42.fr/oauth/token", data=data)
	tmp = response.json()
	access_token = tmp["access_token"]
	return (access_token)

def	doRequestTo42(access_token: str, endpoint: str):
	finalendpoint = "https://api.intra.42.fr" + endpoint
	response = requests.get(finalendpoint, headers={
		'Authorization': 'Bearer %s' % access_token
	})
	return response.json()


def add42UserToDB(jsonFile):
	login42 = jsonFile["login"]
	email42 = jsonFile["email"]
	bool42 = True
	picture = jsonFile["image"]["link"]
	data42 = {
		"username": login42,
		"email": email42,
		"isFrom42": bool42,
		"profilePicture": picture
	}
	newUser42 = UserSerializer(data=data42)
	if (newUser42.is_valid()):
		newUser42.save()
		return (True)
	logger.info(f"Validation errors: {newUser42.errors}")
	return (False)
