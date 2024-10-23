from django.urls import path, include
from users.views import getUser, getAllUsers, postInvite, getFriendsInvitations, getGamesInvitations, getDiscussions, getBlockedUsers, getUsersList, getFriendsList, getUserBlockedRelations

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('blockedUsers/', getBlockedUsers, name="getBlockedUsers"),
	path('blockedUsers2/', getUserBlockedRelations, name="getUserBlockedRelations"),
	path('user/friendsInvitations/', getFriendsInvitations, name="getFriendsInvitations"),
	path('user/gamesInvitations/', getGamesInvitations, name="getFriendsInvitations"),
	path('user/discussions/', getDiscussions, name="getDiscussions"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('friendsList/', getFriendsList, name="getFriendsList"),
	path('usersList/', getUsersList, name="getUsersList")
]