from django.db import models

class User(models.Model):
	username = models.CharField(max_length=50)
	password = models.CharField(max_length=70)
	email = models.CharField(max_length=150)
	date_subscription = models.DateTimeField()
	date_lastvisit = models.DateTimeField()
