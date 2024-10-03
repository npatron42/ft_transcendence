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


    async def disconnect(self, close_code):
        if self.username and self.username in WaitingConsumer.players[self.room_id]:
            WaitingConsumer.players[self.room_id].remove(self.username)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_name = data.get('name')
        nbplayer = data.get('numberPlayerInvited')
    
        if nbplayer:
            logger.info(f"chef c'est recu")
            if self.room_id in WaitingConsumer.nbPlayers:
                logger.info(f"Chef le nombre de joueurs invités ne peut pas être réinitialisé après le début du jeu pour la room {self.room_id}")
            else:
                WaitingConsumer.nbPlayers[self.room_id] = nbplayer
                logger.info(f"Nombre de joueurs invités défini à {WaitingConsumer.nbPlayers[self.room_id]} pour la room {self.room_id}")

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'updatePlayers',
                        'players': WaitingConsumer.players[self.room_id]
                    }
                )

        if user_name:
            logger.info(f"Nom d'utilisateur reçu : {user_name}")
            self.username = user_name
            if user_name not in WaitingConsumer.players[self.room_id]:
                WaitingConsumer.players[self.room_id].append(user_name)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'updatePlayers',
                    'players': WaitingConsumer.players[self.room_id]
                }
            )
        
        if len(WaitingConsumer.players[self.room_id]) == 4:
            logger.info(f"Chef, nous avons 4 joueurs dans la room {self.room_id}")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'startGame',
                }
            )

    async def updatePlayers(self, event):
        await self.send(text_data=json.dumps({'updatePlayers': event['players']}))

    async def startGame(self, event):
        await self.send(text_data=json.dumps({'action': 'startGame'}))
