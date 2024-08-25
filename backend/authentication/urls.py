from django.contrib import admin
from django.urls import path, include
from users.views import getUser, createUser
from .views import authIndex, signUp

urlpatterns = [
    path('', authIndex, name='auth_index'),
    path('signup/', signUp, name='sign_up'),
]