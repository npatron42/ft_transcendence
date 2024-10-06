from django.urls import path, include
from users.views import getUser, getAllUsers, postInvite, getFriendsList, getAllNotifs

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('user/notifs/', getAllNotifs, name="getAllNotifs"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('userFriendsList/', getFriendsList, name="getFriendsList")
]