from django.urls import path, include
from users.views import getUsers, createUser

urlpatterns = [
	path('users/', getUsers, name='getUsers'),
	path('users/create/', createUser, name='createUser')
]