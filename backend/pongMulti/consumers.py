from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio
from random import randint

logger = logging.getLogger(__name__)


async def sendToClient(self, message):
    await self.channel_layer.group_send("shareSocket", {
        "type": "shareSocket",
        "message": message,
    })




class PongConsumer(AsyncWebsocketConsumer):
    paddles = {}
    ball_pos = {}
    ball_dir = {}
    score = {}
    max_scores = {}
    players = {}


    async def connect(self):
        if self.scope['user'].is_authenticated:
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f'game_{self.room_id}'
            await self.channel_layer.group_add("shareSocket", self.channel_name)

            if self.room_id not in PongConsumer.players:
                PongConsumer.players[self.room_id] = []

            if len(PongConsumer.players[self.room_id]) >= 2:
                await self.close()
                return

            player_id = randint(1000, 9999)
            PongConsumer.players[self.room_id].append(player_id)
            self.player_id = player_id

            if self.room_id not in PongConsumer.paddles:
                PongConsumer.paddles[self.room_id] = {'left': 300, 'right': 300}

            if self.room_id not in PongConsumer.ball_pos:
                PongConsumer.ball_pos[self.room_id] = {'x': 450, 'y': 300}
                PongConsumer.ball_dir[self.room_id] = {'x': 1, 'y': 1}

            if self.room_id not in PongConsumer.score:
                PongConsumer.score[self.room_id] = {'player1': 0, 'player2': 0}

            # Ajout du WebSocket dans le groupe de la room
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.info("CONNECTION ACCEPTEEEEEEEEEEEEEEEEEEEEEE")
            myUser = self.scope["user"]
            logger.info("Le user --> %s", myUser)
            await self.send(text_data=json.dumps({"id": player_id}))

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'updatePlayers',
                    'players': PongConsumer.players[self.room_id]
                }
            )

            # Démarre le jeu si 2 joueurs sont connectés
            if len(PongConsumer.players[self.room_id]) == 2:
                max_score = PongConsumer.max_scores.get(self.room_id)
                logger.info(f'Tentative de démarrage du jeu - joueurs: {PongConsumer.players[self.room_id]}, max_score: {max_score}')
                if max_score is not None:
                    self.game_task = asyncio.create_task(self.update_ball(max_score))

    async def updatePlayers(self, event):
        logger.info(f"Liste des joueurs envoyée: {event['players']}")
        await self.send(text_data=json.dumps({'players': event['players']}))

    async def disconnect(self, close_code):
        if hasattr(self, 'game_task'):
            self.game_task.cancel()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info("self ---> %s", self)
        myUser = self.scope["user"]
        logger.info("DECONNECTION de %s, mes players --> %s", myUser, PongConsumer.players)

        await sendToClient(self, "OUI JE FAIS DES TESTS DE COMMUNICATION")

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action', '')
        player_id = data.get('id', None)

        # Set max_score
        if action == 'set_max_score': 
            if self.room_id in PongConsumer.max_scores:
                logger.warning(f"Le max_score ne peut pas être réinitialisé après le début du jeu pour la room {self.room_id}")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'sendMaxScore',
                        'max_score': PongConsumer.max_scores.get(self.room_id)
                    }
                )
            else:
                max_score = data.get('maxScore')
                PongConsumer.max_scores[self.room_id] = max_score
                logger.info(f"Max score défini à {max_score} pour le joueur {self.player_id}")
                # Envoyer le nouveau max_score aux joueurs
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'sendMaxScore',
                        'max_score': max_score
                    }
                )

        if player_id != self.player_id:
            return

        # Définir le côté du joueur
        player_index = PongConsumer.players[self.room_id].index(player_id)
        if player_index == 0:
            side = 'left'
        else:
            side = 'right'

        # Déplacement de la raquette
        if action == 'paddleup':
            self.move_paddle('up', side)
        elif action == 'paddledown':
            self.move_paddle('down', side)

        # Mise à jour de l'état du jeu
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'paddles': PongConsumer.paddles[self.room_id],
                'ball': PongConsumer.ball_pos[self.room_id],
                'score': PongConsumer.score[self.room_id],
                'max_score': PongConsumer.max_scores.get(self.room_id)
            }
        )

    # Nouveau handler pour gérer le type 'sendMaxScore'
    async def sendMaxScore(self, event):
        max_score = event['max_score']
        await self.send(text_data=json.dumps({'max_score': max_score}))

    # Déplacement de la raquette
    def move_paddle(self, direction, side):
        if side == 'left':
            if direction == 'up':
                PongConsumer.paddles[self.room_id]['left'] = max(PongConsumer.paddles[self.room_id]['left'] - 10, 45)
            elif direction == 'down':
                PongConsumer.paddles[self.room_id]['left'] = min(PongConsumer.paddles[self.room_id]['left'] + 10, 600 - 45)
        elif side == 'right':
            if direction == 'up':
                PongConsumer.paddles[self.room_id]['right'] = max(PongConsumer.paddles[self.room_id]['right'] - 10, 45)
            elif direction == 'down':
                PongConsumer.paddles[self.room_id]['right'] = min(PongConsumer.paddles[self.room_id]['right'] + 10, 600 - 45)

    # Mise à jour de la position de la balle
    async def update_ball(self, max_score):
        acceleration = 1.10
        max_speed = 10
        paddle_height = 90
        paddle_width = 10
        ball_radius = 15

        while True:
            if PongConsumer.score[self.room_id]['player1'] >= max_score or PongConsumer.score[self.room_id]['player2'] >= max_score:
                break

            ball = PongConsumer.ball_pos[self.room_id]
            direction = PongConsumer.ball_dir[self.room_id]

            ball['x'] += direction['x']
            ball['y'] += direction['y']

            if ball['y'] <= 0 + ball_radius or ball['y'] >= 600 - ball_radius:
                direction['y'] *= -1

            left_paddle_y = PongConsumer.paddles[self.room_id]['left']
            if ball['x'] <= 15 + paddle_width + ball_radius and left_paddle_y - paddle_height // 2 <= ball['y'] <= left_paddle_y + paddle_height // 2:
                ball['x'] = 15 + paddle_width + ball_radius
                direction['x'] *= -1

                if abs(direction['x']) < max_speed:
                    direction['x'] *= acceleration
                if abs(direction['y']) < max_speed:
                    direction['y'] *= acceleration

            right_paddle_y = PongConsumer.paddles[self.room_id]['right']
            if ball['x'] >= 885 - paddle_width - ball_radius and right_paddle_y - paddle_height // 2 <= ball['y'] <= right_paddle_y + paddle_height // 2:
                ball['x'] = 885 - paddle_width - ball_radius
                direction['x'] *= -1

                if abs(direction['x']) < max_speed:
                    direction['x'] *= acceleration
                if abs(direction['y']) < max_speed:
                    direction['y'] *= acceleration

            if ball['x'] <= 0 or ball['x'] >= 900:
                if ball['x'] <= 0:
                    PongConsumer.score[self.room_id]['player2'] += 1
                elif ball['x'] >= 900:
                    PongConsumer.score[self.room_id]['player1'] += 1

                ball['x'] = 450
                ball['y'] = 300
                direction['x'] = 2
                direction['y'] = 2

            # Mise à jour de l'état du jeu
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'paddles': PongConsumer.paddles[self.room_id],
                    'ball': PongConsumer.ball_pos[self.room_id],
                    'score': PongConsumer.score[self.room_id],
                    'max_score': PongConsumer.max_scores.get(self.room_id)
                }
            )
            await asyncio.sleep(0.01)

    async def game_state(self, event):
        paddles = event['paddles']
        ball = event['ball']
        score = event.get('score')
        max_score = event.get('max_score')

        data = {
            'paddles': paddles,
            'ball': ball,
            'players': PongConsumer.players[self.room_id],
        }

        if score is not None:
            data['score'] = score

        if max_score is not None:
            data['max_score'] = max_score

        await self.send(text_data=json.dumps(data))
