from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

    
class PongConsumer(AsyncWebsocketConsumer):
    paddles = {}
    ball_pos = {}
    ball_dir = {}
    score = {}
    max_scores = {}
    player1 = False
    player2 = False


    async def connect(self):
        if (self.scope["user"].is_authenticated):
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f'game_{self.room_id}'

            if self.room_id not in PongConsumer.paddles:
                PongConsumer.paddles[self.room_id] = {'left': 300, 'right': 300}

            if self.room_id not in PongConsumer.ball_pos:
                PongConsumer.ball_pos[self.room_id] = {'x': 450, 'y': 300}
                PongConsumer.ball_dir[self.room_id] = {'x': 1, 'y': 1}

            if self.room_id not in PongConsumer.score:
                PongConsumer.score[self.room_id] = {'player1': 0, 'player2': 0}

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            user = self.scope["user"]
            if (PongConsumer.player1 == False):
                userId = 0
                PongConsumer.player1 = True
                dataToSend = {
                    "id": userId
                }
            else:
                userId = 1
                PongConsumer.player2 = True
                dataToSend = {
                    "id": userId
                }
            
            await self.accept()
            await self.send(text_data=json.dumps(dataToSend))

    async def disconnect(self, close_code):
        if hasattr(self, 'game_task'):
            self.game_task.cancel()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action', '')

        if action == 'set_max_score':
            max_score = data.get('maxScore', 10)
            logger.info(f'Reçu max_score: {max_score} pour la room {self.room_id}')
            PongConsumer.max_scores[self.room_id] = max_score

            if not hasattr(self, 'game_task') or self.game_task is None:
                self.game_task = asyncio.create_task(self.update_ball())
                return  

        if action == 'paddleup':
            self.move_paddle('up', data.get('side', ''))
        elif action == 'paddledown':
            self.move_paddle('down', data.get('side', ''))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'paddles': PongConsumer.paddles[self.room_id],
                'ball': PongConsumer.ball_pos[self.room_id],
                'score': PongConsumer.score[self.room_id]
            }
        )

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

    async def update_ball(self):
        acceleration = 1.10
        max_speed = 10
        paddle_height = 90
        paddle_width = 10
        ball_radius = 15

        max_score = PongConsumer.max_scores.get(self.room_id, 5)
        logger.info(f'Mise à jour de la balle avec max_score = {max_score} pour la room {self.room_id}')

        while True:
            if PongConsumer.score[self.room_id]['player1'] >= max_score or PongConsumer.score[self.room_id]['player2'] >= max_score:
                logger.info(f'Le score maximum de {max_score} a été atteint. Arrêt du jeu.')
                break

            ball = PongConsumer.ball_pos[self.room_id]
            direction = PongConsumer.ball_dir[self.room_id]

            ball['x'] += direction['x']
            ball['y'] += direction['y']

            # Collision avec les murs (haut et bas)
            if ball['y'] <= 0 + ball_radius or ball['y'] >= 600 - ball_radius:
                direction['y'] *= -1

            # Collision avec la raquette gauche
            left_paddle_y = PongConsumer.paddles[self.room_id]['left']
            if ball['x'] <= 15 + paddle_width + ball_radius and left_paddle_y - paddle_height // 2 <= ball['y'] <= left_paddle_y + paddle_height // 2:
                ball['x'] = 15 + paddle_width + ball_radius  # Corriger la position de la balle pour éviter qu'elle ne "colle" à la raquette
                direction['x'] *= -1

                # Accélérer la balle
                if abs(direction['x']) < max_speed:
                    direction['x'] *= acceleration
                if abs(direction['y']) < max_speed:
                    direction['y'] *= acceleration

            # Collision avec la raquette droite
            right_paddle_y = PongConsumer.paddles[self.room_id]['right']
            if ball['x'] >= 885 - paddle_width - ball_radius and right_paddle_y - paddle_height // 2 <= ball['y'] <= right_paddle_y + paddle_height // 2:
                ball['x'] = 885 - paddle_width - ball_radius  # Corriger la position de la balle pour éviter qu'elle ne "colle" à la raquette
                direction['x'] *= -1

                # Accélérer la balle
                if abs(direction['x']) < max_speed:
                    direction['x'] *= acceleration
                if abs(direction['y']) < max_speed:
                    direction['y'] *= acceleration

            # Réinitialiser la balle si elle sort du cadre (score)
            if ball['x'] <= 0 or ball['x'] >= 900:
                if ball['x'] <= 0:
                    PongConsumer.score[self.room_id]['player2'] += 1
                elif ball['x'] >= 900:
                    PongConsumer.score[self.room_id]['player1'] += 1

                # Réinitialiser la balle
                ball['x'] = 450
                ball['y'] = 300
                direction['x'] = 2
                direction['y'] = 2

            # Envoyer l'état mis à jour du jeu aux clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'paddles': PongConsumer.paddles[self.room_id],
                    'ball': PongConsumer.ball_pos[self.room_id],
                    'score': PongConsumer.score[self.room_id]
                }
            )
            await asyncio.sleep(0.01)

    # Recevoir un message du groupe de la room
    async def game_state(self, event):
        paddles = event['paddles']
        ball = event['ball']
        score = event.get('score')

        # Préparer les données à envoyer
        data = {
            'paddles': paddles,
            'ball': ball,
        }

        if score is not None:
            data['score'] = score

        # Envoyer l'état actuel du jeu à tous les clients
        await self.send(text_data=json.dumps(data))
