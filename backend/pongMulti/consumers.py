from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
    paddles = {}  # Attribut de classe pour stocker la position des raquettes par room
    ball_pos = {}  # Position de la balle par room
    ball_dir = {}  # Direction de la balle par room

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'game_{self.room_id}'

        # Initialiser les positions des raquettes et de la balle si elles n'existent pas déjà
        if self.room_id not in PongConsumer.paddles:
            PongConsumer.paddles[self.room_id] = {'left': 300, 'right': 300}

        if self.room_id not in PongConsumer.ball_pos:
            PongConsumer.ball_pos[self.room_id] = {'x': 400, 'y': 300}
            PongConsumer.ball_dir[self.room_id] = {'x': 1, 'y': 1}

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
            }
        )

    def move_paddle(self, direction, side):
        if side == 'left':
            if direction == 'up':
                PongConsumer.paddles[self.room_id]['left'] = max(PongConsumer.paddles[self.room_id]['left'] - 10, 40)
            elif direction == 'down':
                PongConsumer.paddles[self.room_id]['left'] = min(PongConsumer.paddles[self.room_id]['left'] + 10, 600 - 40)
        elif side == 'right':
            if direction == 'up':
                PongConsumer.paddles[self.room_id]['right'] = max(PongConsumer.paddles[self.room_id]['right'] - 10, 40)
            elif direction == 'down':
                PongConsumer.paddles[self.room_id]['right'] = min(PongConsumer.paddles[self.room_id]['right'] + 10, 600 - 40)

    async def update_ball(self):
        """Met à jour la position de la balle toutes les 50ms"""
        while True:
            ball = PongConsumer.ball_pos[self.room_id]
            direction = PongConsumer.ball_dir[self.room_id]

            ball['x'] += direction['x']
            ball['y'] += direction['y']

            # Collision avec les murs (haut et bas)
            if ball['y'] <= 0 or ball['y'] >= 600:
                direction['y'] *= -1

            # Collision avec les raquettes
            if ball['x'] <= 30 and PongConsumer.paddles[self.room_id]['left'] - 30 <= ball['y'] <= PongConsumer.paddles[self.room_id]['left'] + 30:
                direction['x'] *= -1
            if ball['x'] >= 770 and PongConsumer.paddles[self.room_id]['right'] - 30 <= ball['y'] <= PongConsumer.paddles[self.room_id]['right'] + 30:
                direction['x'] *= -1

            # Réinitialiser la balle si elle sort du cadre
            if ball['x'] <= 0 or ball['x'] >= 800:
                ball['x'] = 400
                ball['y'] = 300
                direction['x'] *= -1
                direction['y'] = 1

            # Envoyer l'état mis à jour du jeu aux clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'paddles': PongConsumer.paddles[self.room_id],
                    'ball': PongConsumer.ball_pos[self.room_id],
                }
            )
            await asyncio.sleep(0.01)

    # Recevoir un message du groupe de la room
    async def game_state(self, event):
        paddles = event['paddles']
        ball = event['ball']

        # Envoyer l'état actuel du jeu à tous les clients
        await self.send(text_data=json.dumps({
            'paddles': paddles,
            'ball': ball
        }))
