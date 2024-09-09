from django.db import models

class Room(models.Model):
    player1 = models.CharField(max_length=100, default="player1")
    player2 = models.CharField(max_length=100, default="player2", null=True, blank=True)

    is_active = models.BooleanField(default=True)