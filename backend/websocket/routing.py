from django.urls import path
from . import consumers
from . import middleware

websocket_urlpatterns = [
    path('ws/status/', middleware.JWTAuthMiddleware(consumers.StatusConsumer.as_asgi())),
    path('ws/inviteFriend/', middleware.JWTAuthMiddleware(consumers.InviteFriendConsumer.as_asgi())),

]