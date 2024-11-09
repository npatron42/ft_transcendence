from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import logging
from users.serializers import UserSerializer
from users.models import User

logger = logging.getLogger(__name__)



# OBJ ---> {"id": id of tournament}
userInTournament = {}

# OBJ ---> [id1, id2, id3, ...] (tournois)
allTournamentsId = []
allSockets = {}
allUsers = []


async def getUserById(myId):
    userTmp = await sync_to_async(User.objects.get)(id=myId)
    userSer = UserSerializer(userTmp)
    return userSer.data

async def sendToSocket(self, socket, message):
        await self.channel_layer.send(socket, {
            "type": "socketTournament",
            "message": message,
        })

async def sendToTournamentsSocket(self, message):
        myLen = len(allUsers)

        i = 0
        while i < myLen:
            myUser = allUsers[i]
            mySocket = allSockets.get(myUser.username)
            await sendToSocket(self, mySocket, message)
            i += 1
        return

async def sendToPlayersInTournament(self, message, idTournament):
        myTournament = await giveTournament(idTournament)
        myPlayers = myTournament["players"]
        i = 0
        myLen = len(userInTournament)
        while i < myLen:
            myUsername = myPlayers[i].get("username")
            logger.info("username --> %s", myUsername)
            mySocket = allSockets.get(myUsername)
            logger.info("LA SOCKET DE MOMO --> %s", mySocket)
            await sendToSocket(self, mySocket, message)
            i += 1
        logger.info("MOMO IS DONE")
        return


async def giveTournament(id):
    players = []
    leader = await getUserById(Tournament.leader[id])
    myLen = len(Tournament.players[id])
    i = 0
    while i < myLen:
        myPlayer = await getUserById(Tournament.players[id][i])
        players.append(myPlayer)
        i += 1
    tournament = {
        "id": id,
        "leader": leader,
        "players": players,
    }
    return tournament

async def returnAllTournaments():
    mySize = len(allTournamentsId)
    i = 0
    result = []
    while i < mySize:
        resultTmp = await giveTournament(allTournamentsId[i])
        result.append(resultTmp)
        i += 1
    return result


def addSocketToUser(socket, username):
    allSockets[username] = socket

def deleteSocketToUser(username):
    del allSockets[username]

async def addPlayerToTournament(self, myUser, idTournamentToJoin):
    if idTournamentToJoin in allTournamentsId:
        userInTournament[myUser.id] = idTournamentToJoin
        Tournament.players[idTournamentToJoin].append(myUser.id)
        await Tournament.sendAllTournaments(self)


class Tournament(AsyncWebsocketConsumer):
    players = {}
    leader = {}

    def clearThings(self, myUser):
        userId = myUser.id
        if userId in userInTournament:
            idTournament = userInTournament[userId]
            del userInTournament[userId]
            myLen = len(allTournamentsId)
            i = 0
            while i < myLen:
                if idTournament == allTournamentsId[i] and len(Tournament.players[idTournament]) == 0:
                    del allTournamentsId[i]
                    return
                i += 1
        return

    async def sendAllTournaments(self):
        allTournaments = await returnAllTournaments()
        myLen = len(allTournamentsId)
        logger.info("Mes tournois dans mon back --> %s", allTournaments)
        logger.info("Le nombre de tournois --> %d", myLen)
        myDataToSend = {
            "allTournaments": allTournaments
        }
        
        await sendToTournamentsSocket(self, myDataToSend)


    async def socketTournament(self, event):
        myUser = self.scope["user"]
        data = event['message']
        await self.send(text_data=json.dumps({
            'message': data
        }))
        # type = data.get("type")


    async def shareSocket(self, event):
        data = event['message']
        # type = data.get("type")


    def printMyTournament(self, id):
        logger.info("----------------------------------------")
        logger.info("| ID : %s", id)
        logger.info("| Players ---> %s", Tournament.players[id])
        logger.info("| Players.username ---> %s", Tournament.players[id][0].username)
        logger.info("| Leader ---> %s", Tournament.leader[id])
        logger.info("----------------------------------------")



    async def connect(self):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            await self.channel_layer.group_add("shareSocket", self.channel_name)
            await self.channel_layer.group_add("socketTournament", self.channel_name)
            await self.accept()
            addSocketToUser(self.channel_name, myUser.username)
            allUsers.append(myUser)


    async def disconnect(self, close_code):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            await self.close()


    async def receive(self, text_data):
        data = json.loads(text_data)
        myUser = self.scope["user"]
        type = data.get("type")

        # CREATION D'UN TOURNOI

        if type == "CREATE-TOURNAMENT":
            idTournament = data.get("idTournament")
            if idTournament not in Tournament.players:
                Tournament.players[idTournament] = []
            if idTournament not in Tournament.leader:
                Tournament.leader[idTournament] = []

            userInTournament[myUser.id] = idTournament
            allTournamentsId.append(idTournament)

            Tournament.leader[idTournament] = myUser.id
            Tournament.players[idTournament].append(myUser.id)
            await Tournament.sendAllTournaments(self)
            # await sendToTournamentsSocket(self, "test")
            # SEND TO EVERY CLIENTS THE TOURNAMENT EXISTING

        elif type == "SHOW-TOURNAMENTS":
            await Tournament.sendAllTournaments(self)

        elif type == "JOIN-TOURNAMENT":

            idTournamentToJoin = data.get("id")
            nbPlayersInTournament = len(Tournament.players[idTournamentToJoin])
            if nbPlayersInTournament == 3:
                await addPlayerToTournament(self, myUser, idTournamentToJoin)
                dataToSend = {
                    "TOURNAMENT-FULL": "MOMO"
                }
                await sendToPlayersInTournament(self, dataToSend, idTournamentToJoin)
                return


            if (nbPlayersInTournament == 4):
                return
            await addPlayerToTournament(self, myUser, idTournamentToJoin)
            

        elif type == "LEAVE-TOURNAMENT":
            idTournament = data.get("id")
            if idTournament in allTournamentsId:
                erasePlayerFromTournamentObject(idTournament, myUser.id)


            Tournament.clearThings(self, myUser)
            await Tournament.sendAllTournaments(self)
            

def erasePlayerFromTournamentObject(idTournament, idPlayer):
    i = 0
    myLen = len(Tournament.players[idTournament])
    while i < myLen:
        if idPlayer == Tournament.players[idTournament][i]:
            del Tournament.players[idTournament][i]
            return
        i += 1
    return 