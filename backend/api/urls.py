from django.urls import path, include
# from users.views import toggle2fa, checkPass, changePass, changeMail, changeName, changeLangue, resetProfilePicture,getUser, getAllUsers, postInvite, getFriendsList, uploadProfilePicture
# from users.views import getUser, getAllUsers, postInvite, getMatchHistory, getFriendsInvitations, getGamesInvitations, getDiscussions, getBlockedUsers, getUsersList, getFriendsList, getUserBlockedRelations
from users import views


urlpatterns = [
	path('user/', views.getUser, name="getUser"),
	path('users/', views.getAllUsers, name="getAllUsers"),
	path('blockedUsers/', views.getBlockedUsers, name="getBlockedUsers"),
	path('blockedUsers2/', views.getUserBlockedRelations, name="getUserBlockedRelations"),
	path('user/friendsInvitations/', views.getFriendsInvitations, name="getFriendsInvitations"),
	path('user/matchHistory/', views.getMatchHistory, name="getMatchHistory"),
	path('user/gamesInvitations/', views.getGamesInvitations, name="getFriendsInvitations"),
	path('user/discussions/', views.getDiscussions, name="getDiscussions"),
	path('sendInvite/', views.postInvite, name="postInvite"),
	path('userFriendsList/', views.getFriendsList, name="getFriendsList"),
	path('uploadProfilePicture/', views.uploadProfilePicture, name='uploadProfilePicture'),
	path('resetProfilePicture/', views.resetProfilePicture, name='resetProfilePicture'),
	path('changeLangue/', views.changeLangue, name='changeLangue'),
	path('changeName/', views.changeName, name='changeName'),
	path('changeMail/', views.changeMail, name='changeMail'),
	path('changePass/', views.changePass, name='changepass'),
	path('checkPass/', views.checkPass, name='checkPass'),
	path('toggle2fa/', views.toggle2fa, name='toggle2fa'),
	path('friendsList/', views.getFriendsList, name="getFriendsList"),
	path('usersList/', views.getUsersList, name="getUsersList")
]