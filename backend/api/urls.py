from django.urls import path, include
from users.views import getUser, getAllUsers

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
]