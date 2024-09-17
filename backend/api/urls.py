from django.urls import path, include
from users.views import getUser, getAllUsers, postInvite, getFriendsList

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('userFriendsList/', getFriendsList, name="getFriendsList")
]