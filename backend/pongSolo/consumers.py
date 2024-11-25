from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
import random
import time
import asyncio
from users.models import Invitation, User, FriendsList
from users.serializers import UserSerializer
import math

logger = logging.getLogger(__name__)

async def getUserByUsername(name):
	return await sync_to_async(User.objects.get)(username=name)

		############
		# CONSUMER #
		############

class PongSoloConsumer(AsyncWebsocketConsumer):
	paddles_pos = {}
	paddle_right_height = {}
	paddle_left_height = {}
	ball_pos = {}
	ball_dir = {}
	score = {}
	score_increment = {}
	max_scores = {}
	players = {}
	invited_players = {}
	power_up_bool = {}
	power_up = {}
	power_up_active = {}
	power_up_position = {}
	power_up_visible = {}
	power_up_timeout = {}
	power_up_cooldown = {}
	power_up_size = {}
	solo_play_power = {}
	inversed_controls = {}
	end = {}

		###########
		# CONNECT #
		###########

	async def shareSocket(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))

	async def connect(self):
		myUser = self.scope["user"]
		if myUser.is_authenticated:
			self.room_id = self.scope['url_route']['kwargs']['room_id']
			self.room_group_name = f'game_{self.room_id}'
			if self.room_id not in PongSoloConsumer.players:
				PongSoloConsumer.players[self.room_id] = []

			if len(PongSoloConsumer.players[self.room_id]) >= 1:
				await self.close()
				return

			if self.room_id not in PongSoloConsumer.paddles_pos:
				PongSoloConsumer.paddles_pos[self.room_id] = {'left': 300, 'right': 300}

			if self.room_id not in PongSoloConsumer.ball_pos:
				PongSoloConsumer.ball_pos[self.room_id] = {'x': 450, 'y': 300}
				PongSoloConsumer.ball_dir[self.room_id] = {'x': 1, 'y': 1}

			if self.room_id not in PongSoloConsumer.score:
				PongSoloConsumer.score[self.room_id] = {'player1': 0, 'player2': 0}
			
			if self.room_id not in PongSoloConsumer.score_increment:
				PongSoloConsumer.score_increment[self.room_id] = {'player1': 1, 'player2': 1}
			
			if self.room_id not in PongSoloConsumer.power_up:
				PongSoloConsumer.power_up[self.room_id] = None
				PongSoloConsumer.power_up_active[self.room_id] = False
				PongSoloConsumer.power_up_position[self.room_id] = {'x': 0, 'y': 0}
				PongSoloConsumer.power_up_cooldown[self.room_id] = 0
				PongSoloConsumer.inversed_controls[self.room_id] = [False, False]
				PongSoloConsumer.power_up_size[self.room_id] = {'width': 40, 'height': 40}
				PongSoloConsumer.end[self.room_id] = False
				PongSoloConsumer.power_up_visible[self.room_id] = False
				PongSoloConsumer.power_up_timeout[self.room_id] = False
				PongSoloConsumer.solo_play_power[self.room_id] = {'bool': False, 'player_affected': None, 'start_effect': False}


			await self.channel_layer.group_add(
				self.room_group_name,
				self.channel_name
			)
			await self.accept()
			await self.channel_layer.group_add("shareSocket", self.channel_name)
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'updatePlayers',
					'players': PongSoloConsumer.players[self.room_id]
				}
			)
		else:
			await self.close()

		##############
		# DISCONNECT #
		##############

	async def disconnect(self, close_code):
		myUser = self.scope["user"]
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


		if action == 'join':
			if not hasattr(self, 'game_task'):
				self.game_task = asyncio.create_task(self.update_ball(PongSoloConsumer.max_scores[self.room_id]))
				PongSoloConsumer.players[self.room_id].append('player1')
				PongSoloConsumer.players[self.room_id].append('player2')

		if action == 'set_max_score':
			if self.room_id in PongSoloConsumer.max_scores:
				logger.warning(f"Le max_score ne peut pas être réinitialisé après le début du jeu pour la room {self.room_id}")
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendMaxScore',
						'max_score': PongSoloConsumer.max_scores.get(self.room_id)
					}
				)
			else:
				max_score = data.get('maxScore')
				PongSoloConsumer.max_scores[self.room_id] = max_score
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendMaxScore',
						'max_score': max_score
					}
				)
			
		if action == 'set_power_up':
			if self.room_id in PongSoloConsumer.power_up_bool:
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendPowerUpBool',
						'power_up_bool': PongSoloConsumer.power_up_bool.get(self.room_id)
					}
				)
			else:
				power_up = data.get('powerUp')
				PongSoloConsumer.power_up_bool[self.room_id] = power_up
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendPowerUpBool',
						'power_up_bool': power_up
					}
				)

		
		if action == 'paddleup' or action == 'paddledown':
			direction = action
			side = data.get('side')
			self.move_paddle(direction, side)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'game_state',
				'paddles_pos': PongSoloConsumer.paddles_pos[self.room_id],
				'ball': PongSoloConsumer.ball_pos[self.room_id],
				'score': PongSoloConsumer.score[self.room_id],
				'max_score': PongSoloConsumer.max_scores.get(self.room_id)
			}
		)
		
		##########
		# PADDLE #
		##########
		
	def move_paddle(self, direction, side):
		if PongSoloConsumer.end[self.room_id] != True:
			if side == 'left':
				if PongSoloConsumer.inversed_controls[self.room_id][0]:
					if direction == 'paddledown':
						PongSoloConsumer.paddles_pos[self.room_id]['left'] = max(PongSoloConsumer.paddles_pos[self.room_id]['left'] - 10, PongSoloConsumer.paddle_left_height[self.room_id] // 2)
					elif direction == 'paddleup':
						PongSoloConsumer.paddles_pos[self.room_id]['left'] = min(PongSoloConsumer.paddles_pos[self.room_id]['left'] + 10, 595 - PongSoloConsumer.paddle_left_height[self.room_id] // 2)
				else:
					if direction == 'paddleup':
						PongSoloConsumer.paddles_pos[self.room_id]['left'] = max(PongSoloConsumer.paddles_pos[self.room_id]['left'] - 10, PongSoloConsumer.paddle_left_height[self.room_id] // 2)
					elif direction == 'paddledown':
						PongSoloConsumer.paddles_pos[self.room_id]['left'] = min(PongSoloConsumer.paddles_pos[self.room_id]['left'] + 10, 595 - PongSoloConsumer.paddle_left_height[self.room_id] // 2)

			elif side == 'right':
				if PongSoloConsumer.inversed_controls[self.room_id][1]:
					if direction == 'paddledown':
						PongSoloConsumer.paddles_pos[self.room_id]['right'] = max(PongSoloConsumer.paddles_pos[self.room_id]['right'] - 10, PongSoloConsumer.paddle_right_height[self.room_id] // 2)
					elif direction == 'paddleup':
						PongSoloConsumer.paddles_pos[self.room_id]['right'] = min(PongSoloConsumer.paddles_pos[self.room_id]['right'] + 10, 595 - PongSoloConsumer.paddle_right_height[self.room_id] // 2)
				else:
					if direction == 'paddleup':
						PongSoloConsumer.paddles_pos[self.room_id]['right'] = max(PongSoloConsumer.paddles_pos[self.room_id]['right'] - 10, PongSoloConsumer.paddle_right_height[self.room_id] // 2)
					elif direction == 'paddledown':
						PongSoloConsumer.paddles_pos[self.room_id]['right'] = min(PongSoloConsumer.paddles_pos[self.room_id]['right'] + 10, 595 - PongSoloConsumer.paddle_right_height[self.room_id] // 2)

		########
		# BALL #
		########


	async def update_ball(self, max_score):
		PongSoloConsumer.paddle_right_height[self.room_id] = 90
		PongSoloConsumer.paddle_left_height[self.room_id] = 90
		speed = 4
		ball = PongSoloConsumer.ball_pos[self.room_id] 
		direction = PongSoloConsumer.ball_dir[self.room_id] = {'x': random.choice([speed, -speed]), 'y': random.choice([-4, 4])}
		acceleration = 0.3
		max_speed = 35
		max_angle = 55
		paddle_width = 10
		ball_radius = 15
		last_player = None

			#normalize direction#
		initial_magnitude = math.sqrt(direction['x']**2 + direction['y']**2)
		direction['x'] = (direction['x'] / initial_magnitude) * speed
		direction['y'] = (direction['y'] / initial_magnitude) * speed
		initial_hypotenuse = math.sqrt(direction['x']**2 + direction['y']**2)


		while True:

			if PongSoloConsumer.end[self.room_id] == True:
				return

				#active PowerUp if is true#
			if PongSoloConsumer.power_up_bool[self.room_id] == True and PongSoloConsumer.power_up_visible[self.room_id] == False and last_player != None and PongSoloConsumer.power_up_timeout[self.room_id] == False and PongSoloConsumer.power_up_active[self.room_id] == False:
				asyncio.create_task(self.generate_power_up())

				#Gestion Ball#
			ball['x'] += direction['x']
			ball['y'] += direction['y']

			if ball['y'] <= 0 + ball_radius or ball['y'] >= 600 - ball_radius:
				direction['y'] *= -1


			if ball['y'] < 0 + ball_radius:
				ball['y'] = 0 + ball_radius
			if ball['y'] > 600 - ball_radius:
				ball['y'] = 600 - ball_radius 

				#Solo Play Colision#
			if PongSoloConsumer.solo_play_power[self.room_id]['bool'] == True:
				affected_player = PongSoloConsumer.solo_play_power[self.room_id]['player_affected']
				if affected_player == last_player:
					PongSoloConsumer.solo_play_power[self.room_id]['start_effect'] = True

					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'sendSoloPlayActive',
							'solo_play_active': True
						}
					)
				if PongSoloConsumer.solo_play_power[self.room_id]['start_effect'] == True:
						if affected_player == PongSoloConsumer.players[self.room_id][0]:
							if ball['x'] >= 445 and ball['x'] <= 455:
								direction['x'] *= -1
						elif affected_player == PongSoloConsumer.players[self.room_id][1]:
							if ball['x'] <= 455 and ball['x'] >= 445:
								direction['x'] *= -1

				#Colision paddle gauche#
			left_paddle_y = PongSoloConsumer.paddles_pos[self.room_id]['left']
			if (ball['x'] <= 10 + paddle_width + ball_radius and 
				left_paddle_y - PongSoloConsumer.paddle_left_height[self.room_id] // 2 - 5 <= ball['y'] <= left_paddle_y + PongSoloConsumer.paddle_left_height[self.room_id] // 2 + 5):

				impact_position = (ball['y'] - left_paddle_y) / (PongSoloConsumer.paddle_left_height[self.room_id] / 2)
				reflection_angle = impact_position * max_angle
				angle_radians = math.radians(reflection_angle)

				direction['x'] = speed * math.cos(angle_radians)
				direction['y'] = speed * math.sin(angle_radians)


				speed = min(speed + acceleration, max_speed)
				
				
				speed = min(speed + acceleration, max_speed)
				

				last_player = PongSoloConsumer.players[self.room_id][0]

				new_hypotenuse2 = math.sqrt(direction['x']**2 + direction['y']**2)

				# Colision paddle droite
			right_paddle_y = PongSoloConsumer.paddles_pos[self.room_id]['right']
			if (ball['x'] >= 890 - paddle_width - ball_radius and 
				right_paddle_y - PongSoloConsumer.paddle_right_height[self.room_id] // 2  -5 <= ball['y'] <= right_paddle_y + PongSoloConsumer.paddle_right_height[self.room_id] // 2 + 5):

				impact_position = (ball['y'] - right_paddle_y) / (PongSoloConsumer.paddle_right_height[self.room_id] / 2)

				reflection_angle = impact_position * max_angle

				angle_radians = math.radians(reflection_angle)

				direction['x'] = -speed * math.cos(angle_radians)
				direction['y'] = speed * math.sin(angle_radians)

				speed = min(speed + acceleration, max_speed)

				last_player = PongSoloConsumer.players[self.room_id][1]

				new_hypotenuse2 = math.sqrt(direction['x']**2 + direction['y']**2)

				#Colision power up#
			if PongSoloConsumer.power_up_visible[self.room_id] == True:
				if self.check_collision(PongSoloConsumer.ball_pos[self.room_id], PongSoloConsumer.power_up_position[self.room_id], ball_radius):
					asyncio.create_task(self.apply_effect(last_player))

				#reset ball#
			if ball['x'] <= 0 or ball['x'] >= 900:
				speed = self.calculate_speed(max_score)
				if ball['x'] <= 0:
					PongSoloConsumer.score[self.room_id]['player2'] += PongSoloConsumer.score_increment[self.room_id]['player2']
					direction['x'] = -speed
					direction['y'] = random.choice([-3, -2, -1, 1, 2, 3])
				elif ball['x'] >= 900:
					PongSoloConsumer.score[self.room_id]['player1'] += PongSoloConsumer.score_increment[self.room_id]['player1']
					direction['x'] = speed
					direction['y'] = random.choice([-3, -2, -1, 1, 2, 3])
				ball['x'] = 450
				ball['y'] = 300

				#reset powerup#
				if PongSoloConsumer.power_up_bool[self.room_id] == True:
					await self.reset_effect()
					PongSoloConsumer.power_up_visible[self.room_id] = False
					PongSoloConsumer.power_up_timeout[self.room_id] = False
					PongSoloConsumer.power_up[self.room_id] = None
					PongSoloConsumer.power_up_position[self.room_id] = None
					last_player = None

					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'new_power_up',
							'position': None,
							'power_up': None,
							'status' : "erase"
						}
					)

				#Win condition#
			if PongSoloConsumer.score[self.room_id]['player1'] >= max_score or PongSoloConsumer.score[self.room_id]['player2'] >= max_score:

				if PongSoloConsumer.score[self.room_id]['player1'] >= max_score:
					winner = PongSoloConsumer.players[self.room_id][0]
				else:
					winner = PongSoloConsumer.players[self.room_id][1]

				PongSoloConsumer.end[self.room_id] = True

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'game_over',
						'winner': winner,
						'score': PongSoloConsumer.score[self.room_id]
					}
				)
				break

				#send game state#
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_state',
					'paddles_pos': PongSoloConsumer.paddles_pos[self.room_id],
					'paddle_left_height': PongSoloConsumer.paddle_left_height[self.room_id],
					'paddle_right_height': PongSoloConsumer.paddle_right_height[self.room_id],
					'ball': PongSoloConsumer.ball_pos[self.room_id],
					'score': PongSoloConsumer.score[self.room_id],
					'max_score': max_score
				}
			)
			await asyncio.sleep(1 / 60)

	def calculate_speed(self, max_score):

		total_score = PongSoloConsumer.score[self.room_id]['player1'] + PongSoloConsumer.score[self.room_id]['player2']
		percent_score = (total_score / 2) * 100 / max_score

		if percent_score < 10:
			return 4.5
		elif percent_score < 25:
			return 5
		elif percent_score < 50:
			return 5.5
		elif percent_score < 75:
			return 6
		else: 
			return 6.5

		############
		# POWER UP #
		############

	async def manage_power_up(self):

		if PongSoloConsumer.end[self.room_id] == True:
			return

		PongSoloConsumer.power_up_timeout[self.room_id] = True
		await asyncio.sleep(30)

		PongSoloConsumer.power_up_visible[self.room_id] = False
		
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'new_power_up',
				'position': None,
				'power_up': None,
				'status' : "erase"
			}
		)
		
		cooldown_duration = random.randint(15, 20)
		PongSoloConsumer.power_up_cooldown[self.room_id] = cooldown_duration
		await asyncio.sleep(PongSoloConsumer.power_up_cooldown[self.room_id])
		PongSoloConsumer.power_up_timeout[self.room_id] = False

	async def generate_power_up(self):

		if PongSoloConsumer.power_up_visible[self.room_id] == True or PongSoloConsumer.power_up_timeout[self.room_id] == True or PongSoloConsumer.end[self.room_id] == True or PongSoloConsumer.power_up_active[self.room_id] == True:
			return

		if random.random() < 0.01:
			PongSoloConsumer.power_up_visible[self.room_id] = True
			power_ups = ['inversed_control', 'increase_paddle', 'decrease_paddle', 'x2', 'solo_play']
			selected_power_up = random.choice(power_ups)
			PongSoloConsumer.power_up_position[self.room_id] = {
				'x': random.randint(100, 800),
				'y': random.randint(100, 500)
			}
			PongSoloConsumer.power_up[self.room_id] = selected_power_up

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'new_power_up',
					'position': PongSoloConsumer.power_up_position[self.room_id],
					'power_up': selected_power_up,
					'status': "add"
				}
			)

			await self.manage_power_up()


	async def apply_effect(self, last_player):
		
			#reset#
		PongSoloConsumer.power_up_visible[self.room_id] = False
		PongSoloConsumer.power_up_position[self.room_id] = None
		PongSoloConsumer.power_up_active[self.room_id] = True
	
			#Increase Paddle#
		if PongSoloConsumer.power_up[self.room_id] == 'increase_paddle':
			if last_player == PongSoloConsumer.players[self.room_id][0]:
				PongSoloConsumer.paddle_left_height[self.room_id] = 150
			elif last_player == PongSoloConsumer.players[self.room_id][1]:
				PongSoloConsumer.paddle_right_height[self.room_id] = 150

			#Inversed controls#
		elif PongSoloConsumer.power_up[self.room_id] =='inversed_control':
			if last_player == PongSoloConsumer.players[self.room_id][0]:
				PongSoloConsumer.inversed_controls[self.room_id][1] = True
			elif last_player == PongSoloConsumer.players[self.room_id][1]:
				PongSoloConsumer.inversed_controls[self.room_id][0] = True

			#Decrease Paddle#
		if PongSoloConsumer.power_up[self.room_id] == 'decrease_paddle':
			if last_player == PongSoloConsumer.players[self.room_id][1]:
				PongSoloConsumer.paddle_left_height[self.room_id] = 50
			elif last_player == PongSoloConsumer.players[self.room_id][0]:
				PongSoloConsumer.paddle_right_height[self.room_id] = 50

			#x2#
		if PongSoloConsumer.power_up[self.room_id] == 'x2':
			if last_player == PongSoloConsumer.players[self.room_id][0]:
				PongSoloConsumer.score_increment[self.room_id]['player1'] = 2
			elif last_player == PongSoloConsumer.players[self.room_id][1]:
				PongSoloConsumer.score_increment[self.room_id]['player2'] = 2

			#solo_play#
		if PongSoloConsumer.power_up[self.room_id] == 'solo_play':
			if last_player == PongSoloConsumer.players[self.room_id][0]:
				PongSoloConsumer.solo_play_power[self.room_id] = {'bool': True, 'player_affected': PongSoloConsumer.players[self.room_id][1], 'start_effect': False}
			elif last_player == PongSoloConsumer.players[self.room_id][1]:
				PongSoloConsumer.solo_play_power[self.room_id] = {'bool': True, 'player_affected': PongSoloConsumer.players[self.room_id][0], 'start_effect': False}


		
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'keeped_power_up',
				'position': None,
				'power_up': None,
				'player_has_power_up': last_player,
				'status': "keeped"
			}
		)
		
		await asyncio.sleep(20)
		PongSoloConsumer.power_up_active[self.room_id] = False
		await self.reset_effect()

	
	async def reset_effect(self):
		PongSoloConsumer.paddle_left_height[self.room_id] = 90
		PongSoloConsumer.paddle_right_height[self.room_id] = 90
		PongSoloConsumer.inversed_controls[self.room_id] = [False, False]
		PongSoloConsumer.score_increment[self.room_id] = {'player1': 1, 'player2': 1}
		PongSoloConsumer.solo_play_power[self.room_id] = {'bool': False, 'player_affected': None, 'start_effect': False}

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'sendPowerUpRelease',
				'power_up_release': True
			}
		)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'sendSoloPlayActive',
				'solo_play_active': False
			}
		)

	def check_collision(self, ball, power_up, ball_radius):
		distance_x = abs(ball['x'] - power_up['x'])
		distance_y = abs(ball['y'] - power_up['y'])
		return distance_x < (ball_radius + PongSoloConsumer.power_up_size[self.room_id]['width'] // 2) and \
			distance_y < (ball_radius + PongSoloConsumer.power_up_size[self.room_id]['height'] // 2)

		###########
		# HANDLER #
		###########

	async def sendPowerUpRelease(self, event):
		await self.send(text_data=json.dumps({'power_up_release': event['power_up_release']}))
	
	async def updatePlayers(self, event):
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
		powerUp = event['power_up']
		await self.send(text_data=json.dumps({'power_up_position': position, "status": status, "power_up": powerUp }))

	async def keeped_power_up(self, event):
		position = event['position']
		status = event['status']
		powerUp = event['power_up']
		playerHasPowerUp = event['player_has_power_up']
		await self.send(text_data=json.dumps({'power_up_position': position, "status": status, "power_up": powerUp, "player_has_power_up": playerHasPowerUp }))

	async def sendSoloPlayActive(self, event):
		await self.send(text_data=json.dumps({'solo_play_active': event['solo_play_active']}))

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
			'players': PongSoloConsumer.players[self.room_id],
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
		PongSoloConsumer.end[self.room_id] = True
		await self.send(text_data=json.dumps({'winner': winner, 'score': score}))


