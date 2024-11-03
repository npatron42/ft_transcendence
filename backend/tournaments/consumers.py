from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)


myTournaments = []


async def sendToTournamentsSocket(self, message):
        await self.channel_layer.group_send("socketTournament", {
            "type": "socketTournament",
            "message": message,
        })


class Tournament(AsyncWebsocketConsumer):
    players = {}
    leader = {}

    async def socketTournament(self, event):
        myUser = self.scope["user"]
        data = event['message']
        logger.info("je recois bien dans mon consumer tournament ---> %s, de la part de --> %s", data, myUser.username)
        # type = data.get("type")


    async def shareSocket(self, event):
        data = event['message']
        # type = data.get("type")


    def printMyTournament(self, id):
        logger.info("----------------------------------------")
        logger.info("ID : %s", id)
        logger.info("Players ---> %s", Tournament.players[id])
        logger.info("Players.username ---> %s", Tournament.players[id][0].username)
        logger.info("Leader ---> %s", Tournament.leader[id])
        logger.info("----------------------------------------")

    async def connect(self):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            logger.info("connection from ---> %s", myUser)
            await self.channel_layer.group_add("shareSocket", self.channel_name)
            await self.channel_layer.group_add("socketTournament", self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            logger.info("disconnection from ---> %s", myUser)
            await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        myUser = self.scope["user"]
        type = data.get("type")

        if type == "CREATE-TOURNAMENT":
            idTournament = data.get("idTournament")
            if idTournament not in Tournament.players:
                Tournament.players[idTournament] = []
            if idTournament not in Tournament.leader:
                Tournament.leader[idTournament] = []

            Tournament.leader[idTournament] = myUser
            Tournament.players[idTournament].append(myUser)
            self.printMyTournament(idTournament)
            await sendToTournamentsSocket(self, "test")
            # SEND TO EVERY CLIENTS THE TOURNAMENT EXISTING

        elif type == "JOIN-TOURNAMENT":
            logger.info("tg")

        logger.info("DATA RECUE DU FRONT ---> %s", data)

        