from django.urls import path, include
from users.views import getUser

urlpatterns = [
	path('users/', getUser, name="getUser"),
]