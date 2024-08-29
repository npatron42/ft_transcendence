from django.urls import path, include
from users.views import getUsers, createUser
from oauth.views import loginOAuth, loginOAuthRedirect

urlpatterns = [
	path('users/', getUsers, name='getUsers'),
	path('create/', createUser, name='createUser'),
]