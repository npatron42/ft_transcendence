from django.urls import path, include
from users.views import getUser, getAllUsers, postInvite, getFriendsList, getAllNotifs, getDiscussions

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('user/notifs/', getAllNotifs, name="getAllNotifs"),
	path('user/discussions/', getDiscussions, name="getDiscussions"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('userFriendsList/', getFriendsList, name="getFriendsList")
]