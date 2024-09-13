from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
	paddles = {}
	ball_pos = {}
	ball_dir = {}

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

	#mouve paddle
	def move_paddle(self, direction, side):
		if side == 'left':
			if direction == 'up':
				PongConsumer.paddles[self.room_id]['left'] = max(PongConsumer.paddles[self.room_id]['left'] - 10, 40)
		

	async def update_ball(self):
	   #faire mouvement balle

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
