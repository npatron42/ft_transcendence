from rest_framework import serializers
from .models import User, Invitation, FriendsList

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profilePicture', 'isFrom42', 'status', 'langue')

class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ('expeditor', 'receiver', 'message', 'parse')


class FriendsListSerializer(serializers.ModelSerializer):
    user1 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    user2 = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = FriendsList
        fields = ['user1', 'user2', 'parse']



