
import jwt
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from django.conf import settings
from users.views import getUserFromJWT
import logging
logger = logging.getLogger(__name__)

def splitQueryString(query_string):
    query_string = query_string.decode('utf-8')
    tab = query_string.split('&')
    result = {}
    for tab in tab:
        if '=' in tab:
            key, value = tab.split('=', 1)
            result[key] = value
    return result

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = splitQueryString(scope['query_string'])
        token = query_string.get('token')
        if token:
            try:
                user = await getUserFromJWT(token)
                if user:
                    scope['user'] = user
                else:
                    scope['user'] = AnonymousUser()

            except jwt.ExpiredSignatureError:
                scope['user'] = AnonymousUser()

            except jwt.InvalidTokenError:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)