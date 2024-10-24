from django.urls import path, include
from users.views import changeLangue, resetProfilePicture,getUser, getAllUsers, postInvite, getFriendsList, getAllNotifs, uploadProfilePicture

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('user/notifs/', getAllNotifs, name="getAllNotifs"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('userFriendsList/', getFriendsList, name="getFriendsList"),
	path('uploadProfilePicture/', uploadProfilePicture, name='uploadProfilePicture'),
	path('resetProfilePicture/', resetProfilePicture, name='resetProfilePicture'),
	path('changeLangue/', changeLangue, name='changeLangue')
]