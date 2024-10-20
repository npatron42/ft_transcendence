from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
import random
import time
import asyncio
from .models import MatchHistory
from users.models import Invitation, User, FriendsList

logger = logging.getLogger(__name__)


		###############
		# MATCH IN DB #
		###############
		
async def save_match(winner, player1, player2, player2_score, player1_score, complete_game):
	try:
		await sync_to_async(MatchHistory.objects.create)(
		player1=player1,
		player2=player2,
		player1_score=player1_score,
		player2_score=player2_score,
		winner=winner,
		completeGame=complete_game
	)
		logger.info("Match sauvegardé")
	except Exception as e:
		logger.error("Erreur lors de la sauvegarde du match: %s", e)

async def getUserByUsername(name):
	return await sync_to_async(User.objects.get)(username=name)

class PongConsumer(AsyncWebsocketConsumer):
	paddles_pos = {}
	paddle_right_height = {}
	paddle_left_height = {}
	ball_pos = {}
	ball_dir = {}
	score = {}
	max_scores = {}
	players = {}
	power_up_bool = {}
	power_up = {}
	power_up_position = {}
	power_up_visible = {}
	power_up_timeout = {}
	power_up_cooldown = {}
	power_up_size = {}
	inversed_controls = {}
	end = {}

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

		if self.room_id not in PongConsumer.paddles_pos:
			PongConsumer.paddles_pos[self.room_id] = {'left': 300, 'right': 300}

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

		PongConsumer.end[self.room_id] = False
		PongConsumer.power_up_visible[self.room_id] = False
		PongConsumer.power_up_timeout[self.room_id] = False
		
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

		if len(PongConsumer.players[self.room_id]) == 2:
			disconnected = self.username
			logger.info("il est parti %s", disconnected)
			player1 = await getUserByUsername(PongConsumer.players[self.room_id][0])
			player2 = await getUserByUsername(PongConsumer.players[self.room_id][1])

			if disconnected == PongConsumer.players[self.room_id][0]:
				winner = PongConsumer.players[self.room_id][1]
				winnerdb = player2
			else:
				winner = PongConsumer.players[self.room_id][0]
				winnerdb = player1
			
			await save_match(winnerdb, player1, player2, 0, 0, False)

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_over',
					'winner': winner,
					'score': PongConsumer.score[self.room_id]
				}
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
			
		if action == 'set_power_up':
			logger.info("OH LE POWERUP")
			if self.room_id in PongConsumer.power_up_bool:
				logger.info("Le powerup ne peut être réinitialisé %s", self.room_id)
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendPowerUpBool',
						'power_up_bool': PongConsumer.power_up_bool.get(self.room_id)
					}
				)
			else:
				power_up = data.get('powerUp')
				PongConsumer.power_up_bool[self.room_id] = power_up
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendPowerUpBool',
						'power_up_bool': power_up
					}
				)

		if action in ['paddleup', 'paddledown']:
			if hasattr(self, 'username') and self.username in PongConsumer.players[self.room_id]:
				player_index = PongConsumer.players[self.room_id].index(self.username)
				if player_index == 0:
					side = 'left' 
				else: 
					side = 'right'
				self.move_paddle(action, side)
			else:
				logger.warning(f"Action reçue pour un utilisateur non enregistré: {self.username}")

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'game_state',
				'paddles_pos': PongConsumer.paddles_pos[self.room_id],
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
	
	async def sendPowerUpBool(self, event):
		power_up_bool = event['power_up_bool']
		await self.send(text_data=json.dumps({'power_up_bool': power_up_bool}))
	
	async def new_power_up(self, event):
		position = event['position']
		status = event['status']
		powerUp = event['power_up']#la
		await self.send(text_data=json.dumps({'power_up_position': position, "status": status, "power_up": powerUp }))

	async def game_state(self, event):
		paddles_pos = event['paddles_pos']
		ball = event['ball']
		score = event.get('score')
		max_score = event.get('max_score')
		paddle_left_height = event.get('paddle_left_height')
		paddle_right_height = event.get('paddle_right_height')

		data = {
			'paddles_pos': paddles_pos,
			'ball': ball,
			'players': PongConsumer.players[self.room_id],
			'paddle_left_height' : paddle_left_height,
			'paddle_right_height': paddle_right_height,
		}

		if score is not None:
			data['score'] = score

		if max_score is not None:
			data['max_score'] = max_score

		await self.send(text_data=json.dumps(data))

	async def game_over(self, event):
		winner = event['winner']
		score = event['score']
		PongConsumer.end[self.room_id] = True
		await self.send(text_data=json.dumps({'winner': winner, 'score': score}))
		
		##########
		# PADDLE #
		##########
		
	def move_paddle(self, direction, side):
		if PongConsumer.end[self.room_id] != True:
			if side == 'left':
				if PongConsumer.inversed_controls[self.room_id][0]:
					if direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['left'] = max(PongConsumer.paddles_pos[self.room_id]['left'] - 10, 45)
					elif direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['left'] = min(PongConsumer.paddles_pos[self.room_id]['left'] + 10, 600 - 45)
				else:
					if direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['left'] = max(PongConsumer.paddles_pos[self.room_id]['left'] - 10, 45)
					elif direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['left'] = min(PongConsumer.paddles_pos[self.room_id]['left'] + 10, 600 - 45)

			elif side == 'right':
				if PongConsumer.inversed_controls[self.room_id][1]:
					if direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['right'] = max(PongConsumer.paddles_pos[self.room_id]['right'] - 10, 45)
					elif direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['right'] = min(PongConsumer.paddles_pos[self.room_id]['right'] + 10, 600 - 45)
				else:
					if direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['right'] = max(PongConsumer.paddles_pos[self.room_id]['right'] - 10, 45)
					elif direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['right'] = min(PongConsumer.paddles_pos[self.room_id]['right'] + 10, 600 - 45)

				
		########
		# BALL #
		########

	async def update_ball(self, max_score):
		PongConsumer.paddle_right_height[self.room_id] = 90
		PongConsumer.paddle_left_height[self.room_id] = 90		
		acceleration = 1.10
		max_speed = 10
		paddle_width = 10
		ball_radius = 15
		last_player = None

		while True:


				#active PowerUp if is true#
			if self.room_id not in PongConsumer.inversed_controls:
				PongConsumer.inversed_controls[self.room_id] = [False, False]  #a refaire
				PongConsumer.power_up_size[self.room_id] = {'width': 40, 'height': 40}
			if PongConsumer.power_up_bool[self.room_id] == True and PongConsumer.power_up_visible[self.room_id] == False and last_player != None:
				asyncio.create_task(self.generate_power_up())

				#Win condition#
			if PongConsumer.score[self.room_id]['player1'] >= max_score or PongConsumer.score[self.room_id]['player2'] >= max_score:

				if PongConsumer.score[self.room_id]['player1'] >= max_score:
					winner = PongConsumer.players[self.room_id][0]
					winnerdb = await getUserByUsername(PongConsumer.players[self.room_id][0])
				else:
					winner = PongConsumer.players[self.room_id][1]
					winnerdb = await getUserByUsername(PongConsumer.players[self.room_id][1])

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'game_over',
						'winner': winner,
						'score': PongConsumer.score[self.room_id]
					}
				)

				p1_score = PongConsumer.score[self.room_id]['player1']
				p2_score = PongConsumer.score[self.room_id]['player2']
				p2 = await getUserByUsername(PongConsumer.players[self.room_id][1])
				p1 = await getUserByUsername(PongConsumer.players[self.room_id][0])

				await save_match(winnerdb, p1, p2, p2_score, p1_score, True)
				break

				#Gestion Ball#
			
			ball = PongConsumer.ball_pos[self.room_id]
			direction = PongConsumer.ball_dir[self.room_id]

			ball['x'] += direction['x']
			ball['y'] += direction['y']

			if ball['y'] <= 0 + ball_radius or ball['y'] >= 600 - ball_radius:
				direction['y'] *= -1

			left_paddle_y = PongConsumer.paddles_pos[self.room_id]['left']
			if (ball['x'] <= 15 + paddle_width + ball_radius and 
				left_paddle_y - PongConsumer.paddle_left_height[self.room_id] // 2 <= ball['y'] <= left_paddle_y + PongConsumer.paddle_left_height[self.room_id] // 2):
				ball['x'] = 15 + paddle_width + ball_radius
				direction['x'] *= -1

				if abs(direction['x']) < max_speed:
					direction['x'] *= acceleration
				if abs(direction['y']) < max_speed:
					direction['y'] *= acceleration

				last_player = PongConsumer.players[self.room_id][0]

			right_paddle_y = PongConsumer.paddles_pos[self.room_id]['right']
			if (ball['x'] >= 885 - paddle_width - ball_radius and 
				right_paddle_y - PongConsumer.paddle_right_height[self.room_id] // 2 <= ball['y'] <= right_paddle_y + PongConsumer.paddle_right_height[self.room_id] // 2):
				ball['x'] = 885 - paddle_width - ball_radius
				direction['x'] *= -1

				if abs(direction['x']) < max_speed:
					direction['x'] *= acceleration
				if abs(direction['y']) < max_speed:
					direction['y'] *= acceleration

				last_player = PongConsumer.players[self.room_id][1]

				#Colision with power up gestion#
			if PongConsumer.power_up_visible[self.room_id] == True:
				if self.check_collision(PongConsumer.ball_pos[self.room_id], PongConsumer.power_up_position[self.room_id], ball_radius):
					asyncio.create_task(self.apply_effect(last_player))


				#reset ball#
			if ball['x'] <= 0 or ball['x'] >= 900:
				if ball['x'] <= 0:
					PongConsumer.score[self.room_id]['player2'] += 1
				elif ball['x'] >= 900:
					PongConsumer.score[self.room_id]['player1'] += 1

				ball['x'] = 450
				ball['y'] = 300
				direction['x'] = 1 if ball['x'] <= 0 else -1
				direction['y'] = 1

					#reset powerup#
				# if PongConsumer.power_up_bool[self.room_id] == True:
				# 	PongConsumer.power_up_visible[self.room_id] = False
				# 	PongConsumer.power_up_timeout[self.room_id] = False
				# 	PongConsumer.power_up[self.room_id] = None
				# 	PongConsumer.power_up_position[self.room_id] = None
				# 	last_player = None
				# 	PongConsumer.inversed_controls[self.room_id] = [False, False]

				# 	await self.channel_layer.group_send(
				# 		self.room_group_name,
				# 		{
				# 			'type': 'new_power_up',
				# 			'position': None,
				# 			'power_up': None,
				# 			'status' : "erase"
				# 		}
				# 	)

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_state',
					'paddles_pos': PongConsumer.paddles_pos[self.room_id],
					'paddle_left_height': PongConsumer.paddle_left_height[self.room_id],
					'paddle_right_height': PongConsumer.paddle_right_height[self.room_id],
					'ball': PongConsumer.ball_pos[self.room_id],
					'score': PongConsumer.score[self.room_id],
					'max_score': max_score
				}
			)
			await asyncio.sleep(1 / 60)


		############
		# POWER UP #
		############

	async def manage_power_up(self):

		logger.info("on wait")
		await asyncio.sleep(30)

		PongConsumer.power_up_visible[self.room_id] = False
		PongConsumer.power_up_timeout[self.room_id] = True
		logger.info("cest ciao")
		
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'new_power_up',
				'position': None,
				'power_up': None,
				'status' : "erase"
			}
		)
		
		cooldown_duration = random.randint(15, 30)
		PongConsumer.power_up_cooldown[self.room_id] = cooldown_duration
		logger.info("minute papillion")
		await asyncio.sleep(5)
		PongConsumer.power_up_timeout[self.room_id] = False

	async def generate_power_up(self):
		if PongConsumer.power_up_visible[self.room_id] == True or PongConsumer.power_up_timeout[self.room_id] == True:
			return

		if random.random() < 0.01:
			power_ups = ['inversed_control', 'increase_paddle']
			selected_power_up = random.choice(power_ups)
			PongConsumer.power_up_position[self.room_id] = {
				'x': random.randint(100, 800),
				'y': random.randint(100, 500)
				# 'x': 450,
				# 'y': 300
			}
			PongConsumer.power_up[self.room_id] = selected_power_up
			PongConsumer.power_up_visible[self.room_id] = True

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'new_power_up',
					'position': PongConsumer.power_up_position[self.room_id],
					'power_up': selected_power_up,
					'status': "add"
				}
			)

		if PongConsumer.power_up_visible[self.room_id] == True:
			await self.manage_power_up()

	def check_collision(self, ball, power_up, ball_radius):
		distance_x = abs(ball['x'] - power_up['x'])
		distance_y = abs(ball['y'] - power_up['y'])
		return distance_x < (ball_radius + PongConsumer.power_up_size[self.room_id]['width'] // 2) and \
			distance_y < (ball_radius + PongConsumer.power_up_size[self.room_id]['height'] // 2)

	async def apply_effect(self, last_player):
		if PongConsumer.power_up[self.room_id] == 'increase_paddle':
			if last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.paddle_left_height[self.room_id] = 150
			elif last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.paddle_right_height[self.room_id] = 150
		elif PongConsumer.power_up[self.room_id] =='inversed_control':
			if last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.inversed_controls[self.room_id][1] = True
			elif last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.inversed_controls[self.room_id][0] = True
		else:
			return
		await asyncio.sleep(15)
		self.reset_effect()
	
	def reset_effect(self):
		PongConsumer.paddle_left_height[self.room_id] = 90
		PongConsumer.paddle_right_height[self.room_id] = 90
		PongConsumer.inversed_controls[self.room_id] = [False, False]



