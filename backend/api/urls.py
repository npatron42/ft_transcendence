from django.urls import path, include
from users.views import getUsers, createUser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
	path('users/', getUsers, name='getUsers'),
	path('create/', createUser, name='createUser'),
	path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]