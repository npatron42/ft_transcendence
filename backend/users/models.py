from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
	status = models.CharField(max_length=15, default="Disconnected")
	friendsList = models.ManyToManyField('self', symmetrical=False, related_name='friend_of', blank=True)
	profilePicture = models.CharField(max_length=250)
	isFrom42 = models.BooleanField(default=False)

class Invitation(models.Model):
	invitationFrom = models.CharField(max_length=50)
	to = models.CharField(max_length=150)
	type = models.CharField(max_length=45)

