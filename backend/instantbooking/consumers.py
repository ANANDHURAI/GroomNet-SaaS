
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from django.conf import settings
from django.utils import timezone
from urllib.parse import parse_qs
from datetime import timedelta
import json
import logging
from customersite.models import Booking

logger = logging.getLogger("django")
User = get_user_model()

class AuthMixin:
    async def authenticate_user(self, token):
       
        try:
            payload = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get('user_id')
            user = await database_sync_to_async(User.objects.get)(id=user_id)
            return user if user.is_active else None
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None

    def get_token_from_scope(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        return token



class ConnectionHandler(AuthMixin):

    async def connect_user(self, scope, channel_layer, channel_name):
        self.scope = scope
        self.channel_layer = channel_layer
        self.channel_name = channel_name

        token = self.get_token_from_scope()
        self.user = await self.authenticate_user(token)

        if not self.user:
            logger.warning("WebSocket rejected: Invalid or expired token")
            return None, 4001

        if self.user.user_type == "barber":
            can_connect = await self._can_barber_connect()
            if not can_connect:
                return None, 4002 
            group_name = f'barber_{self.user.id}'
        else:
            group_name = f'customer_{self.user.id}'

        await self.channel_layer.group_add(group_name, self.channel_name)
        logger.info(f"{self.user.name} joined group: {group_name}")
        return group_name, None

    async def _can_barber_connect(self):
      
        now = timezone.now()
        next_30_minutes = now + timedelta(minutes=30)

        has_active_instant = await database_sync_to_async(
            lambda: Booking.objects.filter(
                barber=self.user,
                booking_type="INSTANT_BOOKING",
                status__in=["PENDING", "CONFIRMED"]
            ).exists()
        )()

        if has_active_instant:
            logger.warning(f"Barber {self.user.id} has active instant booking")
            return False

        has_upcoming_scheduled = await database_sync_to_async(
            lambda: Booking.objects.filter(
                barber=self.user,
                booking_type="SCHEDULE_BOOKING",
                status__in=["PENDING", "CONFIRMED"],
                service_started_at__gte=now,
                service_started_at__lt=next_30_minutes
            ).exists()
        )()

        if has_upcoming_scheduled:
            logger.warning(f"Barber {self.user.id} has upcoming scheduled booking")
            return False

        return True



class MessageHandler:

    async def handle_message(self, user, data, send_callback):
        message_type = data.get('type')

        if message_type == 'heartbeat':
            await self._handle_heartbeat(send_callback)
        elif message_type == 'status_update':
            await self._handle_status_update(user, data, send_callback)
        else:
            logger.warning(f"Unknown message type: {message_type}")
            await send_callback({
                "type": "error",
                "message": f"Unknown message type: {message_type}"
            })

    async def _handle_heartbeat(self, send_callback):
       
        await send_callback({
            "type": "heartbeat_response",
            "timestamp": timezone.now().isoformat()
        })

    async def _handle_status_update(self, user, data, send_callback):
       
        if user.user_type == "barber":
            logger.info(f"Barber {user.id} status update: {data}")
            await send_callback({
                "type": "status_update_received",
                "message": "Status updated successfully"
            })
        else:
            await send_callback({
                "type": "error",
                "message": "Only barbers can send status updates"
            })


class EventBroadcaster:

    async def broadcast(self, send_callback, event_type, payload):
        await send_callback({
            "type": event_type,
            **payload,
            "timestamp": timezone.now().isoformat()
        })



class BookingFlowConsumer(AuthMixin, AsyncWebsocketConsumer):

    async def connect(self):
        self.connection_handler = ConnectionHandler()
        group_name, error_code = await self.connection_handler.connect_user(
            self.scope, self.channel_layer, self.channel_name
        )

        if error_code:
            await self.close(code=error_code)
            return

        self.group_name = group_name
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"User disconnected from group: {self.group_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            handler = MessageHandler()
            await handler.handle_message(
                self.user, data, self.send_json_response
            )
        except json.JSONDecodeError:
            await self.send_json_response({
                "type": "error",
                "message": "Invalid JSON format"
            })

    async def send_json_response(self, payload):
        await self.send(text_data=json.dumps(payload))

    async def new_booking_request(self, event):
        broadcaster = EventBroadcaster()
        await broadcaster.broadcast(self.send_json_response, "new_booking_request", event)

    async def booking_accepted(self, event):
        broadcaster = EventBroadcaster()
        await broadcaster.broadcast(self.send_json_response, "booking_accepted", event)

    async def service_completed(self, event):
        broadcaster = EventBroadcaster()
        await broadcaster.broadcast(self.send_json_response, "service_completed", event)
