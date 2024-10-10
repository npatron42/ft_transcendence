from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio
from .models import MatchHistory

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
	paddles = {}
	ball_pos = {}
	ball_dir = {}
	score = {}
	max_scores = {}
	players = {}

		###########
		# CONNECT #
		###########
		
	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['room_id']
		self.room_group_name = f'game_{self.room_id}'

		if self.room_id not in PongConsumer.players:
			logger.info(f'ajout joueur pour la room {self.room_id}')
			PongConsumer.players[self.room_id] = []

		if len(PongConsumer.players[self.room_id]) >= 2:
			await self.close()
			return

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

		await self.accept()

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'updatePlayers',
				'players': PongConsumer.players[self.room_id]
			}
		)
		
		##############
		# DISCONNECT #
		##############

	async def disconnect(self, close_code):
		if hasattr(self, 'game_task'):
			self.game_task.cancel()

		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		
		###########
		# RECEIVE #
		###########

	async def receive(self, text_data):
		data = json.loads(text_data)
		action = data.get('action', '')
		user_name = data.get('name', None)
		logger.info(f"Data reçue back : {data}")

		if user_name:
			self.username = user_name
			if user_name not in PongConsumer.players[self.room_id]:
				PongConsumer.players[self.room_id].append(user_name)
				logger.info(f"Joueur ajouté: {user_name}")

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'updatePlayers',
						'players': PongConsumer.players[self.room_id]
					}
				)

				if len(PongConsumer.players[self.room_id]) == 2 and PongConsumer.max_scores.get(self.room_id):
					logger.info(f"Démarrage du jeu pour la room {self.room_id} avec les joueurs {PongConsumer.players[self.room_id]}")
					if not hasattr(self, 'game_task'):
						self.game_task = asyncio.create_task(self.update_ball(PongConsumer.max_scores[self.room_id]))

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
				logger.info(f"Max score défini à {max_score} pour la room {self.room_id}")
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendMaxScore',
						'max_score': max_score
					}
				)

				if len(PongConsumer.players[self.room_id]) == 2:
					logger.info(f"Démarrage du jeu pour la room {self.room_id} avec les joueurs {PongConsumer.players[self.room_id]}")
					if not hasattr(self, 'game_task'):
						self.game_task = asyncio.create_task(self.update_ball(max_score))

		if action in ['paddleup', 'paddledown']:
			if hasattr(self, 'username') and self.username in PongConsumer.players[self.room_id]:
				player_index = PongConsumer.players[self.room_id].index(self.username)
				side = 'left' if player_index == 0 else 'right'
				self.move_paddle(action, side)
			else:
				logger.warning(f"Action reçue pour un utilisateur non enregistré: {self.username}")

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
		
		###########
		# HANDLER #
		###########

	async def updatePlayers(self, event):
		logger.info(f"Liste des joueurs envoyée: {event['players']}")
		await self.send(text_data=json.dumps({'players': event['players']}))

	async def sendMaxScore(self, event):
		max_score = event['max_score']
		await self.send(text_data=json.dumps({'max_score': max_score}))

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

	async def game_over(self, event):
		winner = event['winner']
		score = event['score']
		await self.send(text_data=json.dumps({'winner': winner, 'score': score}))
		
		##########
		# PADDLE #
		##########

	def move_paddle(self, direction, side):
		if side == 'left':
			if direction == 'paddleup':
				PongConsumer.paddles[self.room_id]['left'] = max(PongConsumer.paddles[self.room_id]['left'] - 10, 45)
			elif direction == 'paddledown':
				PongConsumer.paddles[self.room_id]['left'] = min(PongConsumer.paddles[self.room_id]['left'] + 10, 600 - 45)
		elif side == 'right':
			if direction == 'paddleup':
				PongConsumer.paddles[self.room_id]['right'] = max(PongConsumer.paddles[self.room_id]['right'] - 10, 45)
			elif direction == 'paddledown':
				PongConsumer.paddles[self.room_id]['right'] = min(PongConsumer.paddles[self.room_id]['right'] + 10, 600 - 45)
				
		########
		# BALL #
		########

	async def update_ball(self, max_score):
		acceleration = 1.10
		max_speed = 10
		paddle_height = 90
		paddle_width = 10
		ball_radius = 15

		while True:
			if PongConsumer.score[self.room_id]['player1'] >= max_score or PongConsumer.score[self.room_id]['player2'] >= max_score:

				if PongConsumer.score[self.room_id]['player1'] >= max_score:
					winner = PongConsumer.players[self.room_id][0]
				else:
					winner = PongConsumer.players[self.room_id][1]

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'game_over',
						'winner': winner,
						'score': PongConsumer.score[self.room_id]
					}
				)
				# p1 = PongConsumer.players[self.room_id][0]
				# p2 = PongConsumer.players[self.room_id][1]
				# p1_score = PongConsumer.score[self.room_id]['player1']
				# p2_score = PongConsumer.score[self.room_id]['player2']

				logger.info(f'je passe par ici')
				# await self.save_match(winner)
				logger.info(f'je passe la')
				break

			ball = PongConsumer.ball_pos[self.room_id]
			direction = PongConsumer.ball_dir[self.room_id]

			ball['x'] += direction['x']
			ball['y'] += direction['y']

			if ball['y'] <= 0 + ball_radius or ball['y'] >= 600 - ball_radius:
				direction['y'] *= -1

			left_paddle_y = PongConsumer.paddles[self.room_id]['left']
			if (ball['x'] <= 15 + paddle_width + ball_radius and 
				left_paddle_y - paddle_height // 2 <= ball['y'] <= left_paddle_y + paddle_height // 2):
				ball['x'] = 15 + paddle_width + ball_radius
				direction['x'] *= -1

				if abs(direction['x']) < max_speed:
					direction['x'] *= acceleration
				if abs(direction['y']) < max_speed:
					direction['y'] *= acceleration

			right_paddle_y = PongConsumer.paddles[self.room_id]['right']
			if (ball['x'] >= 885 - paddle_width - ball_radius and 
				right_paddle_y - paddle_height // 2 <= ball['y'] <= right_paddle_y + paddle_height // 2):
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
				direction['x'] = 1 if ball['x'] <= 0 else -1
				direction['y'] = 1

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_state',
					'paddles': PongConsumer.paddles[self.room_id],
					'ball': PongConsumer.ball_pos[self.room_id],
					'score': PongConsumer.score[self.room_id],
					'max_score': max_score
				}
			)
			await asyncio.sleep(0.01)

	def save_match(winner):
		logger.info(f'Sauvegarde du match:', winner)
		# try:
		# 	match = MatchHistory.objects.create(
		# 	player1=player1,
		# 	player2=player2,
		# 	player1_score=player1_score,
		# 	player2_score=player2_score,
		# 	winner=winner
		# )
		# 	match.save()
		# 	logger.info(f'Match sauvegardé: {match}')
		# except Exception as e:
		# 	logger.error(f"Erreur lors de la sauvegarde du match: {e}")
