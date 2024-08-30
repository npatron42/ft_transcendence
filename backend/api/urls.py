from django.urls import path, include
from oauth.views import loginOAuth, loginOAuthRedirect
from authentication.views import AuthenticationView

urlpatterns = [
	path('users/', AuthenticationView.as_view()),
	# path('create/', createUser, name='createUser'),
]