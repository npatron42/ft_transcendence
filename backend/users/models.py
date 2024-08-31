from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
	date_subscription = models.DateTimeField()
	date_lastvisit = models.DateTimeField()
	friendsList = ArrayField(
        models.CharField(max_length=50),
        size=10,
        blank=True,
        default=list
	)
