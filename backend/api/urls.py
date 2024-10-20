from django.urls import path, include
from users.views import getUser, getAllUsers, postInvite, getAllNotifs, getDiscussions, getBlockedUsers, getUsersList, getFriendsList, getUserBlockedRelations

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('blockedUsers/', getBlockedUsers, name="getBlockedUsers"),
	path('blockedUsers2/', getUserBlockedRelations, name="getUserBlockedRelations"),
	path('user/notifs/', getAllNotifs, name="getAllNotifs"),
	path('user/discussions/', getDiscussions, name="getDiscussions"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('friendsList/', getFriendsList, name="getFriendsList"),
	path('usersList/', getUsersList, name="getUsersList")
]