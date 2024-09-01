from django.urls import path, include
from .views import OAuthView

urlpatterns = [
	path('login/', OAuthView.as_view())
]