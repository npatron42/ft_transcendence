from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
import random
import time
import asyncio
from .models import MatchHistory
from users.models import Invitation, User, FriendsList
from users.serializers import UserSerializer
import math


logger = logging.getLogger(__name__)


async def sendToShareSocket(self, message):
	await self.channel_layer.group_send("shareSocket", {
		"type": "shareSocket",
		"message": message,
	})

async def sendToTournamentSocket(self, message):
    await self.channel_layer.group_send("shareTournaments", {
        "type": "shareTournaments",
        "message": message,
    })

async def sendToTournamentSocket(self, message):
    await self.channel_layer.group_send("shareTournaments", {
        "type": "shareTournaments",
        "message": message,
    })

async def sendGameStatusToUsers(self):
	result = {}
	myLen = len(usersInGame)
	i = 0
	while i < myLen:
		result[usersInGame[i]] = "game"
		i += 1
	dataToSend = {
		"type": "USERS-STATUS-INGAME",
		"status": result,
	}
	await sendToShareSocket(self, dataToSend)

async def removeClientFromUsers(self, username):
	result = {}
	myLen = len(usersInGame)
	i = 0
	while i < myLen:
		result[usersInGame[i]] = "online"
		i += 1
	dataToSend = {
		"type": "USERS-STATUS-OUTGAME",
		"status": result
	}
	i = 0
	while i < myLen:
		if usersInGame[i] == username:
			del usersInGame[i]
			await sendToShareSocket(self, dataToSend)
			return
		i += 1
	# if PongConsumer.power_up_visible[room_id] == True:
				# 	if self.check_collision(PongConsumer.ball_pos[room_id], PongConsumer.power_up_position[room_id], ball_radius):
				# 		asyncio.create_task(self.apply_effect(last_player))

	return

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
	except Exception as e:
		logger.error("Erreur lors de la sauvegarde du match: %s", e)

async def getUserByUsername(name):
	return await sync_to_async(User.objects.get)(username=name)

		############
		# CONSUMER #
		############

usersInGame = []
myMatches = {}
dataIsSent = {}


class PongConsumer(AsyncWebsocketConsumer):
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
	send_db = {}
	matchIsPlayed = {}
	isTournament = {}
	myTasks = {}
	myTasks2 = {}
	idTournament = {}

		###########
		# CONNECT #
		###########

	async def createGameTask(self, room_id, myUser):
		if room_id not in PongConsumer.myTasks:
			PongConsumer.myTasks[room_id] = asyncio.Lock()
		async with PongConsumer.myTasks[room_id]:
			if room_id in myMatches:
				return
			if room_id not in myMatches:
				try:
					if PongConsumer.isTournament[room_id] == True:
						max_score = 1
					else:
						max_score = PongConsumer.max_scores[room_id]
					self.game_task = asyncio.create_task(self.update_ball(max_score))
				except Exception as i:
					logger.info(i)
				myMatches[room_id] = "launched"
		return
	
	async def sendData(self, room_id, dataToSend):
		if room_id not in PongConsumer.myTasks2:
			PongConsumer.myTasks2[room_id] = asyncio.Lock()
		async with PongConsumer.myTasks2[room_id]:
			if room_id in dataIsSent:
				return
			if room_id not in dataIsSent:
				await sendToTournamentSocket(self, dataToSend)
				dataIsSent[room_id] = "sent"
		return


	def printMyObj(room_id):
		logger.info("---------GAME OBJECT---------")
		logger.info("| Players --> %s", PongConsumer.players[room_id])
		logger.info("| Match is played ? --> %s", PongConsumer.matchIsPlayed[room_id])
		logger.info("| Is Tournament ?  --> %s", PongConsumer.isTournament[room_id])
		logger.info("| Paddle pos  --> %s", PongConsumer.paddles_pos[room_id])

	async def shareSocket(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))

	async def shareTournaments(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))

	async def connect(self):
		myUser = self.scope["user"]
		if myUser.is_authenticated:
			self.room_id = self.scope['url_route']['kwargs']['room_id']
			self.room_group_name = f'game_{self.room_id}'
			if self.room_id not in PongConsumer.players:
				PongConsumer.players[self.room_id] = []

			if len(PongConsumer.players[self.room_id]) >= 2:
				await self.close()
				return

			if self.room_id not in PongConsumer.paddles_pos:
				PongConsumer.paddles_pos[self.room_id] = {'left': 300, 'right': 300}
				PongConsumer.paddle_right_height[self.room_id] = 90
				PongConsumer.paddle_left_height[self.room_id] = 90

			if self.room_id not in PongConsumer.ball_pos:
				PongConsumer.ball_pos[self.room_id] = {'x': 450, 'y': 300}
				PongConsumer.ball_dir[self.room_id] = {'x': 1, 'y': 1}

			if self.room_id not in PongConsumer.score:
				PongConsumer.score[self.room_id] = {'player1': 0, 'player2': 0}
			
			if self.room_id not in PongConsumer.score_increment:
				PongConsumer.score_increment[self.room_id] = {'player1': 1, 'player2': 1}
			
			if self.room_id not in PongConsumer.power_up:
				PongConsumer.power_up[self.room_id] = None
				PongConsumer.power_up_active[self.room_id] = False
				PongConsumer.power_up_position[self.room_id] = {'x': 0, 'y': 0}
				PongConsumer.power_up_cooldown[self.room_id] = 0
				PongConsumer.inversed_controls[self.room_id] = [False, False]
				PongConsumer.power_up_size[self.room_id] = {'width': 40, 'height': 40}
				PongConsumer.end[self.room_id] = False
				PongConsumer.power_up_visible[self.room_id] = False
				PongConsumer.power_up_timeout[self.room_id] = False
				PongConsumer.power_up_bool[self.room_id] = False
				PongConsumer.solo_play_power[self.room_id] = {'bool': False, 'player_affected': None, 'start_effect': False}

			
			if self.room_id not in PongConsumer.send_db:
				PongConsumer.send_db[self.room_id] = False

			if self.room_id not in PongConsumer.matchIsPlayed:
				PongConsumer.matchIsPlayed[self.room_id] = False

			# if self.room_id not in PongConsumer.isTournament:
			# 	PongConsumer.isTournament[self.room_id] = False
			
			if self.scope['url_route']['kwargs']['isTournament'] != "true":
				PongConsumer.isTournament[self.room_id] = False
			else:
				PongConsumer.isTournament[self.room_id] = True

			PongConsumer.idTournament[self.room_id] = self.scope['url_route']['kwargs']['idTournament']

			await self.channel_layer.group_add(
				self.room_group_name,
				self.channel_name
			)
			await self.accept()
			await self.channel_layer.group_add("shareSocket", self.channel_name)
			await self.channel_layer.group_add("shareTournament", self.channel_name)
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'updatePlayers',
					'players': PongConsumer.players[self.room_id]
				}
			)
			usersInGame.append(myUser.username)
			await sendGameStatusToUsers(self)

		else:
			await self.close()

		##############
		# DISCONNECT #
		##############

	async def disconnect(self, close_code):
		myUser = self.scope["user"]
		if hasattr(self, 'game_task'):
			self.game_task.cancel()
		if PongConsumer.isTournament[self.room_id] == False:
			await self.channel_layer.group_discard(
				self.room_group_name,
				self.channel_name
			)

			if len(PongConsumer.players[self.room_id]) == 2:
				disconnected = self.username
				player1 = await getUserByUsername(PongConsumer.players[self.room_id][0])
				player2 = await getUserByUsername(PongConsumer.players[self.room_id][1])


				if disconnected == PongConsumer.players[self.room_id][0]:
					winner = PongConsumer.players[self.room_id][1]
					winnerdb = player2
				else:
					winner = PongConsumer.players[self.room_id][0]
					winnerdb = player1
				p1_score = PongConsumer.score[self.room_id]['player1']
				p2_score = PongConsumer.score[self.room_id]['player2']
				if PongConsumer.send_db[self.room_id] == False:
					await save_match(winnerdb, player1, player2, p2_score, p1_score, False)
					PongConsumer.send_db[self.room_id] = True

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'game_over',
						'winner': winner,
						'score': PongConsumer.score[self.room_id]
					}
				)

			if len(PongConsumer.players[self.room_id]) == 1 and PongConsumer.matchIsPlayed[self.room_id] == False:
				myUser = self.scope['user']
				dataToSend = {
					"type": "ABORT-MATCH",
					"userAborted": myUser.username,
				}
				await sendToShareSocket(self, dataToSend)
			await removeClientFromUsers(self, myUser.username)
			PongConsumer.players[self.room_id].remove(self.username)
			return
		
		# DISCONNECTION INTO TOURNAMENTS

		else:


			await self.channel_layer.group_discard(
				self.room_group_name,
				self.channel_name
			)
			if len(PongConsumer.players[self.room_id]) == 2 and PongConsumer.end[self.room_id] == False:
				disconnected = self.username
				player1 = await getUserByUsername(PongConsumer.players[self.room_id][0])
				player2 = await getUserByUsername(PongConsumer.players[self.room_id][1])


				if disconnected == PongConsumer.players[self.room_id][0]:
					myWinner = PongConsumer.players[self.room_id][1]
					myLoser = PongConsumer.players[self.room_id][0]
					winnerdb = player2
				else:
					myWinner = PongConsumer.players[self.room_id][0]
					myLoser = PongConsumer.players[self.room_id][1]
					winnerdb = player1

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'game_over',
						'winner': myWinner,
						'score': PongConsumer.score[self.room_id]
					}
				)

				myPlayers = []
				myPlayers.append(PongConsumer.players[self.room_id][0])
				myPlayers.append(PongConsumer.players[self.room_id][1])
				dataToSend = {
					"type": "RESULTS",
					"idTournament": PongConsumer.idTournament[self.room_id],
					"myWinner": myWinner,
					"myLoser": myLoser,
					"score": PongConsumer.score[self.room_id],
					"players": myPlayers,
				}
				await PongConsumer.sendData(self, self.room_id, dataToSend)
			await removeClientFromUsers(self, myUser.username)
			PongConsumer.players[self.room_id].remove(self.username)
			return
		
		
		###########
		# RECEIVE #
		###########

	async def receive(self, text_data):
		data = json.loads(text_data)
		action = data.get('action', '')
		user_name = data.get('name', None)


		myUser = self.scope["user"]

		if user_name:
			self.username = user_name
			if self.room_id in PongConsumer.invited_players:
				invited_player = PongConsumer.invited_players[self.room_id]

				if user_name != invited_player:
					await self.close()
					return
			

			if user_name not in PongConsumer.players[self.room_id]:
				PongConsumer.players[self.room_id].append(user_name)
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'updatePlayers',
						'players': PongConsumer.players[self.room_id]
					}
				)

				if len(PongConsumer.players[self.room_id]) == 2 and PongConsumer.max_scores.get(self.room_id) and PongConsumer:
					await self.createGameTask(self.room_id, myUser)
					PongConsumer.matchIsPlayed[self.room_id] = True

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
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'sendMaxScore',
						'max_score': max_score
					}
				)
			
		if action == 'set_power_up':
			if self.room_id in PongConsumer.power_up_bool:
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
		
		##########
		# PADDLE #
		##########
		
	def move_paddle(self, direction, side):
		if PongConsumer.end[self.room_id] != True:
			if side == 'left':
				if PongConsumer.inversed_controls[self.room_id][0]:
					if direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['left'] = max(PongConsumer.paddles_pos[self.room_id]['left'] - 10, PongConsumer.paddle_left_height[self.room_id] // 2)
					elif direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['left'] = min(PongConsumer.paddles_pos[self.room_id]['left'] + 10, 595 - PongConsumer.paddle_left_height[self.room_id] // 2)
				else:
					if direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['left'] = max(PongConsumer.paddles_pos[self.room_id]['left'] - 10, PongConsumer.paddle_left_height[self.room_id] // 2)
					elif direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['left'] = min(PongConsumer.paddles_pos[self.room_id]['left'] + 10, 595 - PongConsumer.paddle_left_height[self.room_id] // 2)

			elif side == 'right':
				if PongConsumer.inversed_controls[self.room_id][1]:
					if direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['right'] = max(PongConsumer.paddles_pos[self.room_id]['right'] - 10, PongConsumer.paddle_right_height[self.room_id] // 2)
					elif direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['right'] = min(PongConsumer.paddles_pos[self.room_id]['right'] + 10, 595 - PongConsumer.paddle_right_height[self.room_id] // 2)
				else:
					if direction == 'paddleup':
						PongConsumer.paddles_pos[self.room_id]['right'] = max(PongConsumer.paddles_pos[self.room_id]['right'] - 10, PongConsumer.paddle_right_height[self.room_id] // 2)
					elif direction == 'paddledown':
						PongConsumer.paddles_pos[self.room_id]['right'] = min(PongConsumer.paddles_pos[self.room_id]['right'] + 10, 595 - PongConsumer.paddle_right_height[self.room_id] // 2)

		########
		# BALL #
		########


	# x = ->
	# y = |
	async def update_ball(self, max_score):
		PongConsumer.paddle_right_height[self.room_id] = 90
		PongConsumer.paddle_left_height[self.room_id] = 90
		speed = 2
		ball = PongConsumer.ball_pos[self.room_id] 
		direction = PongConsumer.ball_dir[self.room_id] = {'x': random.choice([speed, -speed]), 'y': random.choice([-4, 4])}
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

			if PongConsumer.end[self.room_id] == True:
				return

				#active PowerUp if is true#
			if PongConsumer.power_up_bool[self.room_id] == True and PongConsumer.power_up_visible[self.room_id] == False and last_player != None and PongConsumer.power_up_timeout[self.room_id] == False and PongConsumer.power_up_active[self.room_id] == False:
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
			if PongConsumer.solo_play_power[self.room_id]['bool'] == True:
				affected_player = PongConsumer.solo_play_power[self.room_id]['player_affected']
				if affected_player == last_player:
					PongConsumer.solo_play_power[self.room_id]['start_effect'] = True

					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'sendSoloPlayActive',
							'solo_play_active': True
						}
					)
				if PongConsumer.solo_play_power[self.room_id]['start_effect'] == True:
						if affected_player == PongConsumer.players[self.room_id][0]:
							if ball['x'] >= 445 and ball['x'] <= 455:
								direction['x'] *= -1
						elif affected_player == PongConsumer.players[self.room_id][1]:
							if ball['x'] <= 455 and ball['x'] >= 445:
								direction['x'] *= -1

				#Colision paddle gauche#
			left_paddle_y = PongConsumer.paddles_pos[self.room_id]['left']
			if (ball['x'] <= 10 + paddle_width + ball_radius and 
				left_paddle_y - PongConsumer.paddle_left_height[self.room_id] // 2 - 5 <= ball['y'] <= left_paddle_y + PongConsumer.paddle_left_height[self.room_id] // 2 + 5):

				impact_position = (ball['y'] - left_paddle_y) / (PongConsumer.paddle_left_height[self.room_id] / 2)
				reflection_angle = impact_position * max_angle
				angle_radians = math.radians(reflection_angle)

				direction['x'] = speed * math.cos(angle_radians)
				direction['y'] = speed * math.sin(angle_radians)


				speed = min(speed + acceleration, max_speed)
				
				
				speed = min(speed + acceleration, max_speed)
				

				last_player = PongConsumer.players[self.room_id][0]

				new_hypotenuse2 = math.sqrt(direction['x']**2 + direction['y']**2)

				# Colision paddle droite
			right_paddle_y = PongConsumer.paddles_pos[self.room_id]['right']
			if (ball['x'] >= 890 - paddle_width - ball_radius and 
				right_paddle_y - PongConsumer.paddle_right_height[self.room_id] // 2  -5 <= ball['y'] <= right_paddle_y + PongConsumer.paddle_right_height[self.room_id] // 2 + 5):

				impact_position = (ball['y'] - right_paddle_y) / (PongConsumer.paddle_right_height[self.room_id] / 2)

				reflection_angle = impact_position * max_angle

				angle_radians = math.radians(reflection_angle)

				direction['x'] = -speed * math.cos(angle_radians)
				direction['y'] = speed * math.sin(angle_radians)

				speed = min(speed + acceleration, max_speed)

				last_player = PongConsumer.players[self.room_id][1]

				new_hypotenuse2 = math.sqrt(direction['x']**2 + direction['y']**2)

				#Colision power up#
			if PongConsumer.power_up_visible[self.room_id] == True:
				if self.check_collision(PongConsumer.ball_pos[self.room_id], PongConsumer.power_up_position[self.room_id], ball_radius):
					asyncio.create_task(self.apply_effect(last_player))

				#reset ball#
			if ball['x'] <= 0 or ball['x'] >= 900:
				speed = self.calculate_speed(max_score)
				if ball['x'] <= 0:
					PongConsumer.score[self.room_id]['player2'] += PongConsumer.score_increment[self.room_id]['player2']
					direction['x'] = -speed
					direction['y'] = random.choice([-3, -2, -1, 1, 2, 3])
				elif ball['x'] >= 900:
					PongConsumer.score[self.room_id]['player1'] += PongConsumer.score_increment[self.room_id]['player1']
					direction['x'] = speed
					direction['y'] = random.choice([-3, -2, -1, 1, 2, 3])
				ball['x'] = 450
				ball['y'] = 300

				#reset powerup#
				if PongConsumer.power_up_bool[self.room_id] == True:
					await self.reset_effect()
					PongConsumer.power_up_visible[self.room_id] = False
					PongConsumer.power_up_timeout[self.room_id] = False
					PongConsumer.power_up[self.room_id] = None
					PongConsumer.power_up_position[self.room_id] = None
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
				if PongConsumer.score[self.room_id]['player1'] >= max_score or PongConsumer.score[self.room_id]['player2'] >= max_score:
					if PongConsumer.score[self.room_id]['player1'] >= max_score:
						winner = PongConsumer.players[self.room_id][0]
						winnerdb = await getUserByUsername(PongConsumer.players[self.room_id][0])
					else:
						winner = PongConsumer.players[self.room_id][1]
						winnerdb = await getUserByUsername(PongConsumer.players[self.room_id][1])

					PongConsumer.end[self.room_id] = True
					if PongConsumer.isTournament[self.room_id] == False:
						await self.channel_layer.group_send(
							self.room_group_name,
							{
								'type': 'game_over',
								'winner': winner,
								'score': PongConsumer.score[self.room_id],
								'idTournament': PongConsumer.idTournament[self.room_id]
							}
						)

						p1_score = PongConsumer.score[self.room_id]['player1']
						p2_score = PongConsumer.score[self.room_id]['player2']
						p2 = await getUserByUsername(PongConsumer.players[self.room_id][1])
						p1 = await getUserByUsername(PongConsumer.players[self.room_id][0])
						if PongConsumer.send_db[self.room_id] == False:
							await save_match(winnerdb, p1, p2, p2_score, p1_score, True)
							PongConsumer.send_db[self.room_id] = True
						break
					else:
						if PongConsumer.score[self.room_id]['player1'] >= max_score or PongConsumer.score[self.room_id]['player2'] >= max_score:
							if PongConsumer.score[self.room_id]['player1'] >= max_score:
								winner = PongConsumer.players[self.room_id][0]
								winnerdb = await getUserByUsername(PongConsumer.players[self.room_id][0])
								myWinner = PongConsumer.players[self.room_id][0]
								myLoser = PongConsumer.players[self.room_id][1]

							else:
								winner = PongConsumer.players[self.room_id][1]
								winnerdb = await getUserByUsername(PongConsumer.players[self.room_id][1])
								myWinner = PongConsumer.players[self.room_id][1]
								myLoser = PongConsumer.players[self.room_id][0]
			

							await self.channel_layer.group_send(
								self.room_group_name,
								{
									'type': 'game_over',
									'winner': winner,
									'score': PongConsumer.score[self.room_id],
									'idTournament': PongConsumer.idTournament[self.room_id]
								}
							)
						
						myPlayers = []
						myPlayers.append(PongConsumer.players[self.room_id][0])
						myPlayers.append(PongConsumer.players[self.room_id][1])
						dataToSend = {
							"type": "RESULTS",
							"idTournament": PongConsumer.idTournament[self.room_id],
							"myWinner": myWinner,
							"myLoser": myLoser,
							"score": PongConsumer.score[self.room_id],
							"players": myPlayers,
						}
						await PongConsumer.sendData(self, self.room_id, dataToSend)

				#send game state#
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

	def calculate_speed(self, max_score):

		total_score = PongConsumer.score[self.room_id]['player1'] + PongConsumer.score[self.room_id]['player2']
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

		if PongConsumer.end[self.room_id] == True:
			return

		PongConsumer.power_up_timeout[self.room_id] = True
		await asyncio.sleep(30)

		PongConsumer.power_up_visible[self.room_id] = False
		
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
		PongConsumer.power_up_cooldown[self.room_id] = cooldown_duration
		await asyncio.sleep(PongConsumer.power_up_cooldown[self.room_id])
		PongConsumer.power_up_timeout[self.room_id] = False

	async def generate_power_up(self):

		if PongConsumer.power_up_visible[self.room_id] == True or PongConsumer.power_up_timeout[self.room_id] == True or PongConsumer.end[self.room_id] == True or PongConsumer.power_up_active[self.room_id] == True:
			return

		if random.random() < 0.01:
			PongConsumer.power_up_visible[self.room_id] = True
			power_ups = ['solo_play']
			selected_power_up = random.choice(power_ups)
			PongConsumer.power_up_position[self.room_id] = {
				'x': random.randint(100, 800),
				'y': random.randint(100, 500)
			}
			PongConsumer.power_up[self.room_id] = selected_power_up

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'new_power_up',
					'position': PongConsumer.power_up_position[self.room_id],
					'power_up': selected_power_up,
					'status': "add"
				}
			)

			await self.manage_power_up()


	async def apply_effect(self, last_player):
		
			#reset#
		PongConsumer.power_up_visible[self.room_id] = False
		PongConsumer.power_up_position[self.room_id] = None
		PongConsumer.power_up_active[self.room_id] = True
	
			#Increase Paddle#
		if PongConsumer.power_up[self.room_id] == 'increase_paddle':
			if last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.paddle_left_height[self.room_id] = 150
			elif last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.paddle_right_height[self.room_id] = 150

			#Inversed controls#
		elif PongConsumer.power_up[self.room_id] =='inversed_control':
			if last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.inversed_controls[self.room_id][1] = True
			elif last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.inversed_controls[self.room_id][0] = True

			#Decrease Paddle#
		if PongConsumer.power_up[self.room_id] == 'decrease_paddle':
			if last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.paddle_left_height[self.room_id] = 50
			elif last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.paddle_right_height[self.room_id] = 50

			#x2#
		if PongConsumer.power_up[self.room_id] == 'x2':
			if last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.score_increment[self.room_id]['player1'] = 2
			elif last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.score_increment[self.room_id]['player2'] = 2

			#solo_play#
		if PongConsumer.power_up[self.room_id] == 'solo_play':
			if last_player == PongConsumer.players[self.room_id][0]:
				PongConsumer.solo_play_power[self.room_id] = {'bool': True, 'player_affected': PongConsumer.players[self.room_id][1], 'start_effect': False}
			elif last_player == PongConsumer.players[self.room_id][1]:
				PongConsumer.solo_play_power[self.room_id] = {'bool': True, 'player_affected': PongConsumer.players[self.room_id][0], 'start_effect': False}


		
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
		PongConsumer.power_up_active[self.room_id] = False
		await self.reset_effect()

	
	async def reset_effect(self):
		PongConsumer.paddle_left_height[self.room_id] = 90
		PongConsumer.paddle_right_height[self.room_id] = 90
		PongConsumer.inversed_controls[self.room_id] = [False, False]
		PongConsumer.score_increment[self.room_id] = {'player1': 1, 'player2': 1}
		PongConsumer.solo_play_power[self.room_id] = {'bool': False, 'player_affected': None, 'start_effect': False}

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
		return distance_x < (ball_radius + PongConsumer.power_up_size[self.room_id]['width'] // 2) and \
			distance_y < (ball_radius + PongConsumer.power_up_size[self.room_id]['height'] // 2)

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


