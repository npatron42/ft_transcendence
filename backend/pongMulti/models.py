from django.db import models
from users.models import User
from django.utils import timezone

class MatchHistory(models.Model):  # Utilisez MatchHistory
    player1 = models.ForeignKey(User, related_name='player1_matches', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='player2_matches', on_delete=models.CASCADE)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.ForeignKey(User, related_name='matches_won', on_delete=models.CASCADE)
