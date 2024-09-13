from rest_framework import serializers
from .models import User, Invitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'profilePicture', 'isFrom42', 'friendsList', 'status')

class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ('expeditor', 'receiver', 'message', 'parse')

