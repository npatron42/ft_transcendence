from django.db import models
from django.contrib.postgres.fields import ArrayField

class User(models.Model):
	username = models.CharField(max_length=50)
	password = models.CharField(max_length=70)
	email = models.CharField(max_length=150)
	date_subscription = models.DateTimeField()
	date_lastvisit = models.DateTimeField()
	friendsList = ArrayField(
        models.CharField(max_length=50),
        size=10,
        blank=True,
        default=list
	)
