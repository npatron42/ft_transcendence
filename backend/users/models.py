from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    status = models.CharField(max_length=15, default="Disconnected")
    profilePicture = models.CharField(max_length=250, default="default.jpg")
    isFrom42 = models.BooleanField(default=False)
    myid42 = models.CharField(default="Not42")
    langue = models.CharField(max_length=10, default="fr")
    tournamentName = models.CharField(max_length=15)
    dauth = models.BooleanField(default=False,  blank=True, null=True)
    otp_code = models.CharField(max_length=6, null=True)
    otp_created_at = models.DateTimeField(null=True)
    sup = models.BooleanField(default=False)
    tournamentsWin = models.IntegerField(default=0)


class Invitation(models.Model):
    expeditor = models.ForeignKey(User, related_name="send_invitation", on_delete=models.CASCADE, default=None)
    receiver = models.ForeignKey(User, related_name="receive_invitation", on_delete=models.CASCADE, default=None)
    message = models.TextField(blank=True, null=True, default=None)
    parse = models.CharField(max_length=125, default=None)
    
class FriendsList(models.Model):
    user1 = models.ForeignKey(User, related_name="user1", on_delete=models.CASCADE, default=None)
    user2 = models.ForeignKey(User, related_name="user2", on_delete=models.CASCADE, default=None)
    parse = models.CharField(max_length=125, default=None)


class RelationsBlocked(models.Model):
    userWhoBlocks = models.ForeignKey(User, related_name="userWhoBlocks", on_delete=models.CASCADE, default=None)
    userBlocked = models.ForeignKey(User, related_name="userBlocked", on_delete=models.CASCADE, default=None)

class GameInvitation(models.Model):
    leader = models.ForeignKey(User, related_name="leader", on_delete=models.CASCADE, default=None)
    userInvited = models.ForeignKey(User, related_name="userInvited", on_delete=models.CASCADE, default=None)
    roomId = models.CharField(max_length=125, default=None)

class Message(models.Model):
    sender = models.ForeignKey(User, related_name="sender", on_delete=models.CASCADE, default=None)
    receiver = models.ForeignKey(User, related_name="receiver", on_delete=models.CASCADE, default=None)
    message = models.CharField(max_length=250, default=None)
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['date']

class GameSettings(models.Model):
    user = models.ForeignKey(User, related_name="user", on_delete=models.CASCADE, default=None)
    up = models.CharField(models.CharField(max_length=10), default="w")
    down = models.CharField(models.CharField(max_length=10), default="s")
    paddleSkin = models.CharField(max_length=125, default="default")
    boardSkin = models.CharField(max_length=125, default="default")
    ballSkin = models.CharField(max_length=125, default="default")



