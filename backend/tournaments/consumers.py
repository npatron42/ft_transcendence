from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)


myTournaments = []

class TournamentsConsumer(AsyncWebsocketConsumer):
    myPlayers = {}
    nbPlayers = 0
    

    async def socketTournament(self, event):
        data = event['message']
        logger.info("je recois bien dans mon consumer tournament ---> %s", data)
        # type = data.get("type")


    async def shareSocket(self, event):
        data = event['message']
        # type = data.get("type")


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
        logger.info("Ce que je recois ---> %s", data)