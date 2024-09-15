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

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'game_{self.room_id}'

        # Initialiser les positions des raquettes et de la balle si elles n'existent pas déjà
        if self.room_id not in PongConsumer.paddles:
            PongConsumer.paddles[self.room_id] = {'left': 300, 'right': 300}

        if self.room_id not in PongConsumer.ball_pos:
            PongConsumer.ball_pos[self.room_id] = {'x': 450, 'y': 300}
            PongConsumer.ball_dir[self.room_id] = {'x': 1, 'y': 1}

        if self.room_id not in PongConsumer.score:
            PongConsumer.score[self.room_id] = {'player1': 0, 'player2': 0}

        # Ajouter dans le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accepter la connexion WebSocket
        await self.accept()

        # Démarrer la mise à jour de la balle
        self.game_task = asyncio.create_task(self.update_ball())
        logger.info(f'Connexion WebSocket acceptée pour la room: {self.room_id}')

    async def disconnect(self, close_code):
        # Arrêter la tâche de mise à jour de la balle si elle existe
        if hasattr(self, 'game_task'):
            self.game_task.cancel()

        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recevoir un message du WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action', '')
        side = data.get('side', '')

        # Mouvements des raquettes
        if action == 'paddleup':
            self.move_paddle('up', side)
        elif action == 'paddledown':
            self.move_paddle('down', side)

        # Diffuser la position mise à jour des raquettes
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'paddles': PongConsumer.paddles[self.room_id],
                'ball': PongConsumer.ball_pos[self.room_id],
                'score': PongConsumer.score[self.room_id]  # Inclure le score
            }
        )

    # Mouvement des raquettes
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

    # Faire mouvement balle
    async def update_ball(self):
        acceleration = 1.10
        max_speed = 10
        paddle_height = 90

        while True:
            ball = PongConsumer.ball_pos[self.room_id]
            direction = PongConsumer.ball_dir[self.room_id]

            # Mettre à jour la position de la balle
            ball['x'] += direction['x']
            ball['y'] += direction['y']

            # Collision avec les murs (haut et bas)
            if ball['y'] <= 0 + 15 or ball['y'] >= 600 - 15:
                direction['y'] *= -1

            # Collision avec la raquette gauche
            if ball['x'] <= 30 and PongConsumer.paddles[self.room_id]['left'] - 30 <= ball['y'] <= PongConsumer.paddles[self.room_id]['left'] + paddle_height:
                direction['x'] *= -1
                ball['x'] = 31

                # Accélérer la balle si la vitesse est en dessous de la limite
                if abs(direction['x']) < max_speed:
                    direction['x'] *= acceleration
                if abs(direction['y']) < max_speed:
                    direction['y'] *= acceleration

            # Collision avec la raquette droite
            if ball['x'] >= 870 and PongConsumer.paddles[self.room_id]['right'] - 30 <= ball['y'] <= PongConsumer.paddles[self.room_id]['right'] + paddle_height:
                direction['x'] *= -1
                ball['x'] = 869  # Ajustement pour éviter de "coller" à la raquette

                # Accélérer la balle si la vitesse est en dessous de la limite
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

            # Normaliser la direction pour éviter une vitesse excessive
            #direction['y'] = max(-max_speed, min(max_speed, direction['y']))
            #direction['x'] = max(-max_speed, min(max_speed, direction['x']))

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
