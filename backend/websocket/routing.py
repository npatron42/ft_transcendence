from django.urls import path
from . import consumers
from . import middleware
from pongMulti.consumers import PongConsumer


websocket_urlpatterns = [
    path('ws/status/', middleware.JWTAuthMiddleware(consumers.StatusConsumer.as_asgi())),
    path('ws/pong/', PongConsumer.as_asgi()),
]