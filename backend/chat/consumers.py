import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from customersite.models import Booking
from .models import ChatMessage
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from jwt import decode as jwt_decode
from django.conf import settings
import asyncio
import time
from django.db import models
User = get_user_model()

ONLINE_USERS = {}

class ChatConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def is_user_in_booking(self, booking, user):
        return booking.customer_id == user.id or booking.barber_id == user.id

    @database_sync_to_async
    def get_booking(self, booking_id):
        try:
            return Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return None
        
    @database_sync_to_async
    def get_unread_count_for_user(self, booking_id, user_id):
        from .models import ChatMessage
        return ChatMessage.objects.filter(
            booking_id=booking_id,
            is_read=False
        ).exclude(sender_id=user_id).count()
    
    @database_sync_to_async
    def get_total_unread_count_for_user(self, user_id):
        from .models import ChatMessage
        from customersite.models import Booking
        
        # Get all bookings where user is involved
        user_bookings = Booking.objects.filter(
            models.Q(customer_id=user_id) | models.Q(barber_id=user_id)
        ).values_list('id', flat=True)
        

        total_count = ChatMessage.objects.filter(
            booking_id__in=user_bookings,
            is_read=False
        ).exclude(sender_id=user_id).count()
        
        # Get per-booking counts
        booking_counts = {}
        for booking_id in user_bookings:
            count = ChatMessage.objects.filter(
                booking_id=booking_id,
                is_read=False
            ).exclude(sender_id=user_id).count()
            if count > 0:
                booking_counts[str(booking_id)] = count
        
        return total_count, booking_counts
    
    

    def set_user_online_status(self, booking_id, user_id, is_online):
        key = f"{booking_id}_{user_id}"
        if is_online:
            ONLINE_USERS[key] = time.time()
        else:
            ONLINE_USERS.pop(key, None)
            print(f"Memory: Set user {user_id} OFFLINE for booking {booking_id}")

    def get_user_online_status(self, booking_id, user_id):
        key = f"{booking_id}_{user_id}"
        if key in ONLINE_USERS:
            if time.time() - ONLINE_USERS[key] < 120:
                print(f"Memory: User {user_id} is ONLINE for booking {booking_id}")
                return True
            else:
                ONLINE_USERS.pop(key, None)
                print(f"Memory: User {user_id} status EXPIRED for booking {booking_id}")
        
        print(f"Memory: User {user_id} is OFFLINE for booking {booking_id}")
        return False
    
    async def send_initial_status(self):
        """Send initial status information to the newly connected user"""
        try:
            other_user_id = await database_sync_to_async(self.get_other_user_id)(
                self.booking, self.user.id
            )
            other_user_online = await database_sync_to_async(self.get_user_online_status)(
                self.booking_id, other_user_id
            )

            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'is_online': other_user_online
            }))
            print(f"WebSocket[{self.connection_id}]: Sent initial status - other user online: {other_user_online}")
        except Exception as e:
            print(f"WebSocket[{self.connection_id}]: Error sending initial status: {e}")

    def get_other_user_id(self, booking, current_user_id):
        if booking.customer_id == current_user_id:
            return booking.barber_id
        return booking.customer_id
    
    async def connect(self):
        print("WebSocket: Trying to connect...")

        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'chat_{self.booking_id}'
        
        # Add connection ID for debugging
        import uuid
        self.connection_id = str(uuid.uuid4())[:8]
        print(f"WebSocket[{self.connection_id}]: Booking ID - {self.booking_id}")

        self.user = AnonymousUser()

        query_string = self.scope.get('query_string', b'').decode()
        print(f"WebSocket[{self.connection_id}]: Query string - {query_string}")

        token = None
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]
            print(f"WebSocket[{self.connection_id}]: Token found")

        if token:
            try:
                UntypedToken(token)
                print(f"WebSocket[{self.connection_id}]: Token is valid")

                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_data.get("user_id")
                print(f"WebSocket[{self.connection_id}]: Decoded user ID - {user_id}")
                
                if user_id:
                    self.user = await database_sync_to_async(User.objects.get)(id=user_id)
                    print(f"WebSocket[{self.connection_id}]: User authenticated - ID: {self.user.id}, Name: {self.user.name}")
                else:
                    print(f"WebSocket[{self.connection_id}]: User ID not found in token")
                    await self.close(code=4001)
                    return
                        
            except (InvalidToken, TokenError, User.DoesNotExist, Exception) as e:
                print(f"WebSocket[{self.connection_id}]: Token validation error: {e}")
                await self.close(code=4001)
                return
        else:
            print(f"WebSocket[{self.connection_id}]: No token provided")
            await self.close(code=4001)
            return

        self.booking = await self.get_booking(self.booking_id)
        if not self.booking:
            print(f"WebSocket[{self.connection_id}]: Booking does not exist")
            await self.close(code=4002)
            return

        print(f"WebSocket[{self.connection_id}]: Booking found - ID: {self.booking.id}, Status: {self.booking.status}")

        authorized = await self.is_user_in_booking(self.booking, self.user)
        if not authorized:
            print(f"WebSocket[{self.connection_id}]: User not authorized for this booking")
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket[{self.connection_id}]: Connection accepted and joined group {self.room_group_name}")

        # Set user online status
        await database_sync_to_async(self.set_user_online_status)(
            self.booking_id, self.user.id, True
        )

        # Send initial status to this user
        await self.send_initial_status()

        # Broadcast this user's online status to others in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status_update',
                'user_id': self.user.id,
                'is_online': True
            }
        )
        print(f"WebSocket[{self.connection_id}]: Broadcasted user online status")

        # Start heartbeat task
        self.heartbeat_task = asyncio.create_task(self.heartbeat())
        print(f"WebSocket[{self.connection_id}]: Heartbeat task started")



    async def disconnect(self, close_code):
        print(f"WebSocket: Starting disconnect process with code {close_code}")
        
        if hasattr(self, 'heartbeat_task'):
            self.heartbeat_task.cancel()
            print("WebSocket: Heartbeat task cancelled")

        if hasattr(self, 'user') and hasattr(self, 'booking_id'):
            await database_sync_to_async(self.set_user_online_status)(
                self.booking_id, self.user.id, False
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status_update',
                    'user_id': self.user.id,
                    'is_online': False
                }
            )
            print("WebSocket: Broadcasted user offline status")

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        print(f"WebSocket: Disconnected and left group")

    async def heartbeat(self):
        try:
            while True:
                await asyncio.sleep(30)
                if hasattr(self, 'user') and hasattr(self, 'booking_id'):
                    await database_sync_to_async(self.set_user_online_status)(
                        self.booking_id, self.user.id, True
                    )
                    print(f"Heartbeat[{getattr(self, 'connection_id', 'unknown')}]: Updated status for user {self.user.id}")
                else:
                    break
        except asyncio.CancelledError:
            print(f"Heartbeat[{getattr(self, 'connection_id', 'unknown')}]: Task cancelled")
            pass
        except Exception as e:
            print(f"Heartbeat[{getattr(self, 'connection_id', 'unknown')}]: Error {e}")
            

    @database_sync_to_async
    def create_chat_message(self, booking, user, message_text):
        return ChatMessage.objects.create(
            booking=booking,
            sender=user,
            message=message_text
        )

    async def receive(self, text_data):
        print(f"WebSocket: Received data - {text_data}")
        try:
            data = json.loads(text_data)
            
            if data.get('type') == 'typing':
                is_typing = data.get('is_typing', False)
                print(f"WebSocket: Processing typing indicator - User {self.user.id} is_typing: {is_typing}")
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user_id': self.user.id,
                        'is_typing': is_typing
                    }
                )
                print(f"WebSocket: Typing indicator broadcasted to group")
                return

            message_text = data.get('message', '').strip()

            if not message_text:
                print("WebSocket: Empty message, ignoring")
                return

            if self.booking.status in ['COMPLETED', 'CANCELLED']:
                print("WebSocket: Booking is not active")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Cannot send messages to completed or cancelled bookings'
                }))
                return

            message = await self.create_chat_message(
                booking=self.booking,
                user=self.user,
                message_text=message_text
            )
            print(f"WebSocket: Message saved - ID: {message.id}")

            # After creating the message, replace the broadcast section:
            message_data = {
                'id': message.id,
                'message': message.message,
                'sender': {
                    'id': self.user.id,
                    'name': self.user.name,
                    'email': self.user.email
                },
                'timestamp': message.timestamp.isoformat(),
                'is_read': message.is_read
            }

            # Broadcast immediately without delay
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_data': message_data
                }
            )
            print("WebSocket: Message broadcast to group")

         
            other_user_id = await database_sync_to_async(self.get_other_user_id)(
                self.booking, self.user.id
            )

         
            await self.send_total_unread_update(other_user_id)

        except Exception as e:
            print(f"WebSocket: Error in receive - {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to send message'
            }))


    async def chat_message(self, event):
        message_data = event['message_data']
        other_user_id = await database_sync_to_async(self.get_other_user_id)(
            self.booking, self.user.id
        )
        
        unread_count = None
        if message_data['sender']['id'] != self.user.id:
            unread_count = await self.get_unread_count_for_user(
                self.booking_id, self.user.id
            )
        
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': message_data,
            'unread_count': unread_count
        }))
    print("WebSocket: Message sent to client")

    async def typing_indicator(self, event):
        user_id = event['user_id']
        is_typing = event['is_typing']
        
        print(f"WebSocket: Received typing event - User {user_id}, is_typing: {is_typing}, current_user: {self.user.id}")
        
        if user_id != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'is_typing': is_typing
            }))
            print(f"WebSocket: Typing indicator sent to client - {is_typing}")
        else:
            print(f"WebSocket: Skipping typing indicator for sender")

    async def user_status_update(self, event):
        user_id = event['user_id']
        is_online = event['is_online']
        
        print(f"WebSocket: Received status event - User {user_id}, is_online: {is_online}, current_user: {self.user.id}")
        if user_id != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'is_online': is_online
            }))
            print(f"WebSocket: User status update sent to client - {is_online}")
        else:
            print(f"WebSocket: Skipping status update for sender")


    async def send_total_unread_update(self, user_id):
        """Send total unread count update to user via global notification channel"""
        try:
            total_count, booking_counts = await self.get_total_unread_count_for_user(user_id)
            
            # Send to global notification channel
            await self.channel_layer.group_send(
                f'notifications_{user_id}',
                {
                    'type': 'notification_update',
                    'update_type': 'total_unread_update',
                    'total_count': total_count,
                    'booking_counts': booking_counts
                }
            )
            
            print(f"Sent global notification update to user {user_id}: {total_count}")
        except Exception as e:
            print(f"Error sending global notification update: {e}")

    async def unread_count_update(self, event):
        user_id = event['user_id']
        unread_count = event['unread_count']
        booking_id = event['booking_id']
       
        if user_id == self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'unread_count_update',
                'booking_id': booking_id,
                'unread_count': unread_count
            }))
            print(f"WebSocket: Unread count update sent - {unread_count}")

    async def total_unread_update(self, event):
        user_id = event['user_id']
        total_count = event['total_count']
        booking_counts = event['booking_counts']
        
        if user_id == self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'total_unread_update',
                'total_count': total_count,
                'booking_counts': booking_counts
            }))
            print(f"WebSocket: Total unread update sent - {total_count}")

    async def send_total_unread_update_wrapper(self, event):
        user_id = event['user_id']
        await self.send_total_unread_update(user_id)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]

        if token:
            try:
                UntypedToken(token)
                decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_data.get("user_id")
                
                if user_id:
                    self.user = await database_sync_to_async(User.objects.get)(id=user_id)
                    self.group_name = f'notifications_{user_id}'
                    
                    await self.channel_layer.group_add(
                        self.group_name,
                        self.channel_name
                    )
                    
                    await self.accept()
                    print(f"Notification WebSocket connected for user {user_id}")
                    return
                        
            except Exception as e:
                print(f"Notification WebSocket error: {e}")
        
        await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def notification_update(self, event):
        await self.send(text_data=json.dumps({
            'type': event['update_type'],
            'total_count': event.get('total_count'),
            'booking_counts': event.get('booking_counts'),
            'booking_id': event.get('booking_id'),
            'unread_count': event.get('unread_count')
        }))