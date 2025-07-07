import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from jwt import decode as jwt_decode
from authservice.models import User
from customersite.models import Booking
from barbersite.models import BarberService


class InstantBookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        
        await self.authenticate_user()
        
        if self.user == AnonymousUser():
            await self.close()
            return
            
        self.customer_room = f"customer_booking_{self.booking_id}"
        
        if self.user.user_type == 'customer':
            await self.channel_layer.group_add(self.customer_room, self.channel_name)
            await self.accept()
            await self.send_booking_to_barbers()
           
            asyncio.create_task(self.auto_cancel_booking())
            
        elif self.user.user_type == 'barber':
            self.barber_room = f"barber_{self.user.id}_booking_{self.booking_id}"
            await self.channel_layer.group_add(self.barber_room, self.channel_name)
            await self.accept()
            
            booking = await self.get_booking()
            if booking and not booking.barber and booking.status == 'PENDING':
                nearby_barbers = await self.get_nearby_barbers(booking)
                if self.user in nearby_barbers:
                    await self.send_booking_request_to_barber(booking)
                else:
                    print(f"Barber {self.user.id} not in nearby barbers list")

    async def authenticate_user(self):
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            
            if not token:
                self.user = AnonymousUser()
                return
            
            UntypedToken(token)
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_data.get('user_id')
            
            if user_id:
                self.user = await self.get_user(user_id)
            else:
                self.user = AnonymousUser()
                
        except (InvalidToken, TokenError, Exception) as e:
            print(f"Authentication error: {e}")
            self.user = AnonymousUser()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user != AnonymousUser():
            if self.user.user_type == 'customer':
                await self.channel_layer.group_discard(self.customer_room, self.channel_name)
            elif self.user.user_type == 'barber':
                barber_room = f"barber_{self.user.id}_booking_{self.booking_id}"
                await self.channel_layer.group_discard(barber_room, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action")
            
            if action == "accept" and self.user.user_type == "barber":
                await self.handle_barber_accept()
            elif action == "reject" and self.user.user_type == "barber":
                await self.handle_barber_reject()
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "error": "Invalid JSON format"
            }))

    async def send_booking_to_barbers(self):
        booking = await self.get_booking()
        if booking.barber:
            return
            
        nearby_barbers = await self.get_nearby_barbers(booking)
        
        if not nearby_barbers:
            await self.send(text_data=json.dumps({
                "message": "No barbers available",
                "no_barbers": True
            }))
            return
        
      
        for barber in nearby_barbers:
            await self.channel_layer.group_send(
                "general_room",
                {
                    "type": "send_booking_request",
                    "data": {
                        "booking_id": self.booking_id,
                        "service_name": booking.service.name,
                        "price": float(booking.service.price),
                        "duration": booking.service.duration_minutes,
                        "customer_name": booking.customer.name,
                        "customer_location": {
                            "address": f"{booking.address.building}, {booking.address.street}, {booking.address.city}"
                        },
                        "message": "New booking request"
                    }
                }
            )
        
        await self.send(text_data=json.dumps({
            "message": f"Request sent to {len(nearby_barbers)} barbers",
            "barbers_count": len(nearby_barbers)
        }))

    async def send_booking_request_to_barber(self, booking):
        await self.send(text_data=json.dumps({
            "booking_id": self.booking_id,
            "service_name": booking.service.name,
            "price": float(booking.service.price),
            "duration": booking.service.duration_minutes,
            "customer_name": booking.customer.name,
            "customer_location": {
                "address": f"{booking.address.building}, {booking.address.street}, {booking.address.city}"
            },
            "message": "New booking request"
        }))

    async def handle_barber_accept(self):
        booking = await self.get_booking()
        
        if booking.barber:
            await self.send(text_data=json.dumps({
                "message": "Already assigned",
                "already_assigned": True
            }))
            return
        
        success = await self.assign_barber_to_booking(booking.id, self.user.id)
        
        if success:
            await self.send(text_data=json.dumps({
                "message": "Booking accepted",
                "customer_name": booking.customer.name,
                "customer_phone": booking.customer.phone,
                "customer_location": {
                    "address": f"{booking.address.building}, {booking.address.street}, {booking.address.city}"
                },
                "service_name": booking.service.name,
                "booking_accepted": True
            }))
            
            await self.channel_layer.group_send(
                self.customer_room,
                {
                    "type": "send_barber_assigned",
                    "data": {
                        "message": "Barber assigned",
                        "barber_name": self.user.name,
                        "barber_phone": self.user.phone,
                        "barber_profile": self.user.profileimage.url if self.user.profileimage else None,
                        "booking_confirmed": True
                    }
                }
            )
            
        
            nearby_barbers = await self.get_nearby_barbers(booking)
            for barber in nearby_barbers:
                if barber.id != self.user.id: 
                    barber_room = f"barber_{barber.id}_booking_{self.booking_id}"
                    await self.channel_layer.group_send(
                        barber_room,
                        {
                            "type": "send_booking_taken",
                            "data": {
                                "message": "Booking taken",
                                "booking_taken": True
                            }
                        }
                    )
        else:
            await self.send(text_data=json.dumps({
                "message": "Already assigned",
                "already_assigned": True
            }))

    async def handle_barber_reject(self):
        await self.send(text_data=json.dumps({
            "message": "Booking rejected",
            "booking_rejected": True
        }))

    async def auto_cancel_booking(self):
        await asyncio.sleep(120) 
        
        booking = await self.get_booking()
        if not booking.barber:
            await self.update_booking_status(booking.id, "CANCELLED")
            
            await self.channel_layer.group_send(
                self.customer_room,
                {
                    "type": "send_booking_timeout",
                    "data": {
                        "message": "Request expired",
                        "booking_expired": True
                    }
                }
            )
            
            nearby_barbers = await self.get_nearby_barbers(booking)
            for barber in nearby_barbers:
                barber_room = f"barber_{barber.id}_booking_{self.booking_id}"
                await self.channel_layer.group_send(
                    barber_room,
                    {
                        "type": "send_booking_timeout",
                        "data": {
                            "message": "Request expired",
                            "booking_expired": True
                        }
                    }
                )

    async def send_booking_request(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def send_barber_assigned(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def send_booking_taken(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def send_booking_timeout(self, event):
        await self.send(text_data=json.dumps(event["data"]))

   
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()

    @database_sync_to_async
    def get_booking(self):
        try:
            return Booking.objects.select_related('customer', 'service', 'address').get(id=self.booking_id)
        except Booking.DoesNotExist:
            return None

    @database_sync_to_async
    def get_nearby_barbers(self, booking):
        try:
           
            barber_services = BarberService.objects.filter(
                service=booking.service,
                is_active=True,
                barber__is_active=True,
                barber__is_online=True
            ).select_related('barber')

            nearby_barbers = []
            for barber_service in barber_services:
                nearby_barbers.append(barber_service.barber)
                print(f"Found nearby barber: {barber_service.barber.name} (ID: {barber_service.barber.id})")
            
            print(f"Total nearby barbers found: {len(nearby_barbers)}")
            return nearby_barbers

        except Exception as e:
            print(f"Error finding nearby barbers: {e}")
            return []

    @database_sync_to_async
    def assign_barber_to_booking(self, booking_id, barber_id):
        try:
            booking = Booking.objects.select_for_update().get(id=booking_id)
            if booking.barber is None:
                booking.barber_id = barber_id
                booking.status = 'CONFIRMED'
                booking.save()
                print(f"Booking {booking_id} assigned to barber {barber_id}")
                return True
            print(f"Booking {booking_id} already assigned to barber {booking.barber_id}")
            return False
        except Booking.DoesNotExist:
            print(f"Booking {booking_id} not found")
            return False

    @database_sync_to_async
    def update_booking_status(self, booking_id, status):
        try:
            Booking.objects.filter(id=booking_id).update(status=status)
            print(f"Booking {booking_id} status updated to {status}")
            return True
        except Exception as e:
            print(f"Error updating booking status: {e}")
            return False
        


class BarberGeneralConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.authenticate_user()
        
        if self.user == AnonymousUser() or self.user.user_type != "barber":
            await self.close()
            return

        await self.channel_layer.group_add("general_room", self.channel_name)
        await self.accept()

    async def authenticate_user(self):
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            
            if not token:
                self.user = AnonymousUser()
                return
            
            UntypedToken(token)
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_data.get('user_id')
            
            if user_id:
                self.user = await self.get_user(user_id)
            else:
                self.user = AnonymousUser()
                
        except (InvalidToken, TokenError, Exception) as e:
            print(f"Authentication error: {e}")
            self.user = AnonymousUser()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("general_room", self.channel_name)

    async def send_booking_request(self, event):
        booking_id = event.get('data', {}).get('booking_id')
        if booking_id:
            is_eligible = await self.check_if_barber_eligible(booking_id)
            if is_eligible:
                await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()

    @database_sync_to_async
    def check_if_barber_eligible(self, booking_id):
        try:
            booking = Booking.objects.select_related('service').get(id=booking_id)
            return BarberService.objects.filter(
                barber=self.user,
                service=booking.service,
                is_active=True
            ).exists()
        except:
            return False
