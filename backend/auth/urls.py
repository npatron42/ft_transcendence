from django.contrib import admin
from django.urls import path, include
from ..users.views import getUser, createUser

urlpatterns = [
    path('auth/', '')
]