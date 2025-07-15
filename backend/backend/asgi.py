import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from chat.routing import websocket_urlpatterns as chat_websocket
from instantbooking.routing import websocket_urlpatterns as booking_websocket

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat_websocket + booking_websocket
        )
    ),
})

# print("WebSocket URL patterns:", chat_websocket + booking_websocket)


