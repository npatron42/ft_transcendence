from django.urls import path, include
from users.views import toggle2fa, checkPass, changePass, changeMail, changeName, changeLangue, resetProfilePicture,getUser, getAllUsers, postInvite, getFriendsList, getAllNotifs, uploadProfilePicture

urlpatterns = [
	path('user/', getUser, name="getUser"),
	path('users/', getAllUsers, name="getAllUsers"),
	path('user/notifs/', getAllNotifs, name="getAllNotifs"),
	path('sendInvite/', postInvite, name="postInvite"),
	path('userFriendsList/', getFriendsList, name="getFriendsList"),
	path('uploadProfilePicture/', uploadProfilePicture, name='uploadProfilePicture'),
	path('resetProfilePicture/', resetProfilePicture, name='resetProfilePicture'),
	path('changeLangue/', changeLangue, name='changeLangue'),
	path('changeName/', changeName, name='changeName'),
	path('changeMail/', changeMail, name='changeMail'),
	path('changePass/', changePass, name='changepass'),
	path('checkPass/', checkPass, name='checkPass'),
	path('toggle2fa/', toggle2fa, name='toggle2fa')
]