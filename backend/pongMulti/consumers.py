import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.paddle_position = 0

    async def connect(self):
        logger.info("Client connecté")
        await self.accept()

    async def disconnect(self, close_code):
        logger.info(f"Client déconnecté, code : {close_code}")

    async def receive(self, text_data):
        logger.info(f"Message reçu : {text_data}")
        data = json.loads(text_data)
        action = data.get('action', '')

        # Logique de mouvement de la raquette en fonction de l'action reçue
        if action == 'paddleup':
            logger.info("Raquette vers le haut")
        elif action == 'paddledown':
            logger.info("Raquette vers le bas")
