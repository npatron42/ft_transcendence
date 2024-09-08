import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accepter la connexion WebSocket
        await self.accept()

    async def disconnect(self, close_code):
        # Gestion de la déconnexion WebSocket
        pass
