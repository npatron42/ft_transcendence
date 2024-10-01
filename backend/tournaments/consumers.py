from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio
from random import randint

logger = logging.getLogger(__name__)

class WaitingConsumer(AsyncWebsocketConsumer):
    players = {}

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'game_{self.room_id}'

        if self.room_id not in WaitingConsumer.players:
            WaitingConsumer.players[self.room_id] = []

        self.player_id = randint(1000, 9999)
        self.username = None

        # Ajout du WebSocket dans le groupe de la room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'updatePlayers',
                'players': WaitingConsumer.players[self.room_id]
            }
        )

    async def updatePlayers(self, event):
        await self.send(text_data=json.dumps({'updatePlayers': event['players']}))

    async def disconnect(self, close_code):
        # Retirer le joueur de la liste lors de la déconnexion
        if self.username and self.username in WaitingConsumer.players[self.room_id]:
            WaitingConsumer.players[self.room_id].remove(self.username)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_name = data.get('name')

        if user_name:
            logger.info(f"Nom d'utilisateur reçu : {user_name}")
            self.username = user_name

            # Mise à jour des joueurs
            if user_name not in WaitingConsumer.players[self.room_id]:
                WaitingConsumer.players[self.room_id].append(user_name)

            # Envoyer la mise à jour des joueurs à tous les clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'updatePlayers',
                    'players': WaitingConsumer.players[self.room_id]
                }
            )
