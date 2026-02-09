import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack


from chat.routing import websocket_urlpatterns as chat_websocket_with_notification

application = ProtocolTypeRouter({

    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat_websocket_with_notification
        )
    ),
})