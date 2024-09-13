from django.urls import path
from .views import CreateRoom

urlpatterns = [
    path('create/', CreateRoom.as_view(), name='create-room'),
]
