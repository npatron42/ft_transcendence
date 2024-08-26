from django.urls import path
from users.views import UserView


urlpatterns = [
	path('home/', UserView.as_view()),
]