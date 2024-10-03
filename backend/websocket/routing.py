from django.urls import path
from django.urls import re_path
from . import consumers
from . import middleware
from pongMulti.consumers import PongConsumer
from tournaments.consumers import WaitingConsumer


websocket_urlpatterns = [
    path('ws/pong/<str:room_id>', middleware.JWTAuthMiddleware(PongConsumer.as_asgi())),
    path('ws/waitTournaments/<str:room_id>', middleware.JWTAuthMiddleware(WaitingConsumer.as_asgi())),
    path('ws/socketUser/', middleware.JWTAuthMiddleware(consumers.handleSocketConsumer.as_asgi())),
]
