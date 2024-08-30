from django.urls import path, include
from .views import loginOAuth, loginOAuthRedirect

urlpatterns = [
	path('login/', loginOAuth, name='loginOAuth'),
	path('login/redirect/', loginOAuthRedirect, name='loginOAuthRedirct')
]