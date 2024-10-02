from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class WaitingConsumer(AsyncWebsocketConsumer):
    players = {}
    nbPlayers = {}

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'waitTournaments_{self.room_id}'

        if self.room_id not in WaitingConsumer.players:
            WaitingConsumer.players[self.room_id] = []

        self.username = None

        # Ajout du WebSocket dans le groupe de la room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Envoi initial de la liste des joueurs dans la room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'updatePlayers',
                'players': WaitingConsumer.players[self.room_id]
            }
        )

    async def updatePlayers(self, event):
        # Envoi de la liste des joueurs mis à jour
        await self.send(text_data=json.dumps({'updatePlayers': event['players']}))

    async def disconnect(self, close_code):
        # Retirer le joueur par son nom lors de la déconnexion
        if self.username and self.username in WaitingConsumer.players[self.room_id]:
            WaitingConsumer.players[self.room_id].remove(self.username)

        # Retirer le WebSocket du groupe de la room
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_name = data.get('name')
        nbplayer = data.get('numberPlayerInvited')
    
        # Si l'action concerne le nombre de joueurs invités
        if nbplayer:
            logger.info(f"chef c'est recu")
            number_player_invited = data.get('numberPlayerInvited', 10)
            if self.room_id in WaitingConsumer.nbPlayers:
                logger.info(f"Chef le nombre de joueurs invités ne peut pas être réinitialisé après le début du jeu pour la room {self.room_id}")
            else:
                WaitingConsumer.nbPlayers[self.room_id] = number_player_invited
                logger.info(f"Nombre de joueurs invités défini à {number_player_invited} pour la room {self.room_id}")

            # Envoyer la mise à jour à tous les clients
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'updatePlayers',
                        'players': WaitingConsumer.players[self.room_id]
                    }
                )

    # Gestion du nom d'utilisateur
        if user_name:
            logger.info(f"Nom d'utilisateur reçu : {user_name}")
            self.username = user_name
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

