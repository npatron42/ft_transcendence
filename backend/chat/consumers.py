from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
logger = logging.getLogger(__name__)

#self contient --> type, le user, les headers, le path, query_string
#                  channel_name --> identifiant de connexion (socket)


class StatusConsumer(AsyncWebsocketConsumer):

    def addToPool(self, key, value):
        self.usersPool[key] = value

    def getFromPool(self, key):
        return self.usersPool.get(key, None)
    
    async def connect(self):
        if self.scope['user'].is_authenticated:
            logger.info("User connected")
            user = self.scope['user']
            await self.accept()
        else:
            logger.info("Connection refused, user not authenticated")
            await self.close()

    async def disconnect(self, close_code):
        logger.info("User disconnected")
        pass

