from django.urls import path, include
from users.views import UserView

urlpatterns = [
	path('users/', UserView.as_view()),
	# path('create/', createUser, name='createUser'),
]