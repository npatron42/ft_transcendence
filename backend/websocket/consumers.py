from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from asgiref.sync import sync_to_async
from users.serializers import UserSerializer, InvitationSerializer
from users.models import Invitation, User
logger = logging.getLogger(__name__)
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


async def getUserByUsername(name):
    return await sync_to_async(User.objects.get)(username=name)


async def saveInvitation(myInvitation):
    await sync_to_async(myInvitation.save)()


async def checkInvitation(parse_value):
    invitation_exists = await sync_to_async(
        lambda: Invitation.objects.filter(parse=parse_value).exists()
    )()
    if (invitation_exists == True):
        return invitation_exists
    
    key1, key2 = parse_value.split("|", 1)
    newStr = key2 + "|" + key1
    otherinvitation_exists = await sync_to_async(
        lambda: Invitation.objects.filter(parse=newStr).exists()
    )()


    if (invitation_exists == False and otherinvitation_exists == False):
        return (False)
    return (True)



class InviteFriendConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        if self.scope['user'].is_authenticated:
            await self.channel_layer.group_add("notification", self.channel_name)
            await self.channel_layer.group_add("invitations", self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
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
        myReceiverUsername = data.get('to')
        typeMessage = data.get('type')
        parse = data.get('parse')
        myExpeditor = self.scope['user']
        myReceiver = await getUserByUsername(myReceiverUsername)

        myInvitation = Invitation(expeditor=myExpeditor, receiver=myReceiver, message=typeMessage, parse=parse)
        invitation_exists = await checkInvitation(parse)
        if (invitation_exists):
            sendData = {
                "error": "Invitation already sent"
            }
            await self.send(text_data=json.dumps(sendData))
        else:
            await saveInvitation(myInvitation)
            sendData = {
                "success": "Invitation sent"
            }
            await self.send(text_data=json.dumps(sendData))


    async def notification_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
