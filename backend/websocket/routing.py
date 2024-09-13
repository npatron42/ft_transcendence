from django.urls import path
from django.urls import re_path
from . import consumers
from . import middleware
from pongMulti.consumers import PongConsumer


websocket_urlpatterns = [
    path('ws/status/', middleware.JWTAuthMiddleware(consumers.StatusConsumer.as_asgi())),
    path('ws/pong/', PongConsumer.as_asgi()),
    re_path(r'ws/pong/(?P<room_name>\w+)/$', PongConsumer.as_asgi()),
    path('ws/inviteFriend/', middleware.JWTAuthMiddleware(consumers.InviteFriendConsumer.as_asgi())),

]