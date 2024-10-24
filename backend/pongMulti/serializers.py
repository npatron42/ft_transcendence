from rest_framework import serializers
from .models import MatchHistory

class MatchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchHistory
        fields = ('player1', 'player2', 'player1_score', 'player2_score', 'winner')