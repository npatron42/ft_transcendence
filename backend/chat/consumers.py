from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from asgiref.sync import sync_to_async
from users.serializers import UserSerializer
logger = logging.getLogger(__name__)

#self contient --> type, le user, les headers, le path, query_string
#                  channel_name --> identifiant de connexion (socket)

usersPool = {}
usersStatus = {}

def changeUserStatus(key, isConnected: bool):
    usersStatus[key] = isConnected

def addToPool(key, value):
    usersPool[key] = value

def getFromPool(key):
    return usersPool.get(key, None)

def removeFromPool(key):
    usersPool.pop(key)


class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'].is_authenticated:
            logger.info("User connected")
            user = self.scope['user']
            addToPool(user, self.channel_name)
            changeUserStatus(user.username, True)
            await self.accept()
            logger.info("Users POOL : ")
            logger.info(usersPool)
            logger.info("Users Status : ")
            logger.info(usersStatus)
            all_sockets = usersPool.values()
            for x in all_sockets:
                await self.channel_layer.send(x, {
                    "type": "status_message",
                    "message": usersStatus
            })
            user.status = "Connected"
            await sync_to_async(user.save)()
        else:
            logger.info("Connection refused, user not authenticated")
            await self.close()

    async def disconnect(self, close_code):
        await self.close()
        logger.info("User disconnected")
        user = self.scope['user']
        removeFromPool(self.scope['user'])
        changeUserStatus(user.username, False)
        logger.info("Users POOL : ")
        logger.info(usersPool)
        logger.info("Users Status : ")
        logger.info(usersStatus)
        all_sockets = usersPool.values()
        for x in all_sockets:
            await self.channel_layer.send(x, {
                "type": "status_message",
                "message": usersStatus
            })
        user.status = "Disconnected"
        await sync_to_async(user.save)()

    async def status_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))



        
    


