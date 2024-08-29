from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
	friendsList = ArrayField(
        models.CharField(max_length=50),
        size=10,
        blank=True,
        default=list
	),
	profilePicture = models.CharField(max_length=250, default=None),
	isFrom42 = models.BooleanField(default=False)


