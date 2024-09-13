from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from asgiref.sync import sync_to_async
from users.serializers import UserSerializer, InvitationSerializer
logger = logging.getLogger(__name__)

#self contient --> type, le user, les headers, le path, query_string
#                  channel_name --> identifiant de connexion (socket)

import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
import logging

logger = logging.getLogger(__name__)

usersPool = {}
usersStatus = {}
pool_lock = asyncio.Lock()


# UTILS FUNCTIONS FOR USER STATUS


async def changeUserStatus(key, isConnected: bool):
    usersStatus[key] = isConnected

async def addToPool(key, value):
    async with pool_lock:
        usersPool[key.username] = value

async def getFromPool(key):
    async with pool_lock:
        return usersPool.get(key.username, None)

async def removeFromPool(key):
    async with pool_lock:
        usersPool.pop(key.username, None)

async def update_user_status(user, status):
    user.status = status
    await sync_to_async(user.save)()

class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'].is_authenticated:
            user = self.scope['user']
            await addToPool(user, self.channel_name)
            await changeUserStatus(user.username, True)
            await self.channel_layer.group_add("status_updates", self.channel_name)
            await self.accept()

            await self.send_status_to_all()
            await update_user_status(user, "Connected")
        else:
            await self.close()

    async def disconnect(self, close_code):
        user = self.scope['user']
        await removeFromPool(user)
        await changeUserStatus(user.username, False)
        await self.channel_layer.group_discard("status_updates", self.channel_name)

        await self.send_status_to_all()
        await update_user_status(user, "Disconnected")

    async def send_status_to_all(self):
        await self.channel_layer.group_send(
            "status_updates",
            {
                "type": "status_message",
                "message": usersStatus,
            }
        )


    async def status_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))




# UTILS FUNCTIONS FOR THE WAITINGINVITATIONS


async def update_Invitation(Invitation, data):
    Invitation.waitList = data
    await sync_to_async(Invitation.save)()


class InviteFriendConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        if self.scope['user'].is_authenticated:
            await self.channel_layer.group_add("invitations", self.channel_name)
            await self.channel_layer.group_add("notification", self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notification", self.channel_name)
        pass;
    
    async def send_notif(self, notif):
        await self.channel_layer.group_send(
            "notification",
            {
                "type": "notification_message",
                "message": notif,
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data);
        expeditor_username = data.get('expeditor')
        receiver_username = data.get('receiver')
        myNotif = data.get('notification')
        myUser = self.scope['user']
        if (myNotif != "None"): # NOTIF A SEND AU USER CONNECTE
            data = {
                "notification": receiver_username,
            }
            await self.send_notif(data)
            logger.info(data)
        # waitingInvitaiton = data
        # waitingInvitation

            
            

    async def notification_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))








        
    


