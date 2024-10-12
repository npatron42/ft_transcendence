from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone


class User(AbstractUser):
	status = models.CharField(max_length=15, default="Disconnected")
	profilePicture = models.CharField(max_length=250)
	isFrom42 = models.BooleanField(default=False)

class Invitation(models.Model):
    expeditor = models.ForeignKey(User, related_name="send_invitation", on_delete=models.CASCADE, default=None)
    receiver = models.ForeignKey(User, related_name="receive_invitation", on_delete=models.CASCADE, default=None)
    message = models.TextField(blank=True, null=True, default=None)
    parse = models.CharField(max_length=125, default=None)
    
class FriendsList(models.Model):
    user1 = models.ForeignKey(User, related_name="user1", on_delete=models.CASCADE, default=None)
    user2 = models.ForeignKey(User, related_name="user2", on_delete=models.CASCADE, default=None)
    parse = models.CharField(max_length=125, default=None)

class Message(models.Model):
    sender = models.ForeignKey(User, related_name="sender", on_delete=models.CASCADE, default=None)
    receiver = models.ForeignKey(User, related_name="receiver", on_delete=models.CASCADE, default=None)
    message = models.CharField(max_length=125, default=None)
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['date']


