from django.urls import path
from django.urls import re_path
from . import consumers
from . import middleware
from pongMulti.consumers import PongConsumer
from tournaments.consumers import Tournament
from pongSolo.consumers import PongSoloConsumer

websocket_urlpatterns = [
    path('ws/pong/<str:room_id>/<str:isTournament>/<str:idTournament>/', middleware.JWTAuthMiddleware(PongConsumer.as_asgi())),
    path('ws/tournamentsConsumer/', middleware.JWTAuthMiddleware(Tournament.as_asgi())),
    path('ws/pong/<str:room_id>/', middleware.JWTAuthMiddleware(PongConsumer.as_asgi())),
    path('ws/pongSolo/<str:room_id>/', middleware.JWTAuthMiddleware(PongSoloConsumer.as_asgi())),
    path('ws/socketUser/', middleware.JWTAuthMiddleware(consumers.handleSocketConsumer.as_asgi())),
]
