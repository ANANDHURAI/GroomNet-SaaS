import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from authservice.models import User
from adminsite.models import ServiceModel
from profileservice.models import UserProfile, Address
from urllib.parse import parse_qs
import jwt
from django.conf import settings
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class InstantBookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        
        if not token:
            await self.close(code=4003)
            return

        user = await self.get_user_from_token(token)
        if not user:
            await self.close(code=4003)
            return
            
        self.scope["user"] = user
        
        if user.user_type == "barber":
            self.group_name = f"barber_{user.id}"
        elif user.user_type == "customer":
            self.group_name = f"customer_{user.id}"
        else:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Log successful connection
        logger.info(f"User {user.id} ({user.user_type}) connected to group {self.group_name}")

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"User disconnected from group {self.group_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action")
            user = self.scope["user"]

            if user.user_type == "barber":
                if action == "accept_booking":
                    await self.handle_accept_booking(data)
                elif action == "reject_booking":
                    await self.handle_reject_booking(data)
                elif action == "toggle_online":
                    await self.handle_toggle_online(data)
                    
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON format"}))
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({"error": "Internal server error"}))

    async def handle_accept_booking(self, data):
        """Barber accepts the booking request"""
        customer_id = data.get("customer_id")
        service_id = data.get("service_id")
        barber_id = self.scope["user"].id

        if not customer_id or not service_id:
            await self.send(text_data=json.dumps({"error": "Missing customer_id or service_id"}))
            return

        try:
            # Get barber details
            barber = await self.get_user_details(barber_id)
            service = await self.get_service_details(service_id)
            
            if not barber or not service:
                await self.send(text_data=json.dumps({"error": "Barber or service not found"}))
                return
            
            # Get barber profile image URL
            barber_profile_image = ""
            if barber.profileimage:
                barber_profile_image = f"http://localhost:8000{barber.profileimage.url}"
            
            # Send acceptance to customer
            await self.channel_layer.group_send(
                f"customer_{customer_id}", {
                    "type": "booking_accepted",
                    "barber_id": barber_id,
                    "barber_name": barber.name,
                    "barber_phone": barber.phone or "",
                    "barber_profile_image": barber_profile_image,
                    "service_id": service_id,
                    "service_name": service.name,
                    "service_price": str(service.price),
                }
            )
            
            # Get customer details for confirmation
            customer = await self.get_user_details(customer_id)
            
            # Confirm to barber
            await self.send(text_data=json.dumps({
                "type": "booking_confirmed",
                "message": "Booking request accepted successfully",
                "customer_name": customer.name if customer else "Unknown"
            }))
            
            logger.info(f"Barber {barber_id} accepted booking from customer {customer_id}")
            
        except Exception as e:
            logger.error(f"Error in handle_accept_booking: {e}")
            await self.send(text_data=json.dumps({"error": "Failed to accept booking"}))

    async def handle_reject_booking(self, data):
        """Barber rejects the booking request"""
        customer_id = data.get("customer_id")
        service_id = data.get("service_id")
        barber_id = self.scope["user"].id

        if not customer_id or not service_id:
            await self.send(text_data=json.dumps({"error": "Missing customer_id or service_id"}))
            return

        try:
            # Find next available barber (excluding current barber)
            next_barber = await self.find_next_barber(service_id, exclude_barber_id=barber_id)
            
            if next_barber:
                # Get complete customer and service details
                customer_data = await self.get_customer_complete_details(customer_id)
                service_data = await self.get_service_complete_details(service_id)
                
                await self.channel_layer.group_send(
                    f"barber_{next_barber.id}", {
                        "type": "send_booking_request",
                        "customer_id": customer_id,
                        "customer_name": customer_data.get("name", "Unknown"),
                        "customer_phone": customer_data.get("phone", ""),
                        "customer_profile_image": customer_data.get("profile_image", ""),
                        "customer_address": customer_data.get("address", {}),
                        "service_id": service_id,
                        "service_name": service_data.get("name", "Unknown Service"),
                        "service_price": service_data.get("price", "0"),
                        "timestamp": datetime.now().isoformat()
                    }
                )
                
                logger.info(f"Booking request forwarded from barber {barber_id} to barber {next_barber.id}")
            else:
                # No more barbers available
                await self.channel_layer.group_send(
                    f"customer_{customer_id}", {
                        "type": "no_barbers_available",
                        "message": "No barbers available right now"
                    }
                )
                
                logger.info(f"No more barbers available for service {service_id}")
            
            # Confirm rejection to barber
            await self.send(text_data=json.dumps({
                "type": "booking_rejected",
                "message": "Booking request rejected"
            }))
            
        except Exception as e:
            logger.error(f"Error in handle_reject_booking: {e}")
            await self.send(text_data=json.dumps({"error": "Failed to reject booking"}))

    async def handle_toggle_online(self, data):
        """Toggle barber online status"""
        is_online = data.get("is_online", False)
        barber_id = self.scope["user"].id
        
        try:
            success = await self.update_barber_online_status(barber_id, is_online)
            
            if success:
                await self.send(text_data=json.dumps({
                    "type": "online_status_updated",
                    "is_online": is_online,
                    "message": f"Status updated to {'online' if is_online else 'offline'}"
                }))
                logger.info(f"Barber {barber_id} status updated to {'online' if is_online else 'offline'}")
            else:
                await self.send(text_data=json.dumps({
                    "type": "error",
                    "message": "Failed to update online status"
                }))
        except Exception as e:
            logger.error(f"Error in handle_toggle_online: {e}")
            await self.send(text_data=json.dumps({"error": "Failed to update status"}))

    # WebSocket message handlers
    async def send_booking_request(self, event):
        """Send booking request to barber"""
        try:
            await self.send(text_data=json.dumps({
                "type": "new_booking_request",
                "customer_id": event["customer_id"],
                "customer_name": event["customer_name"],
                "customer_phone": event.get("customer_phone", ""),
                "customer_profile_image": event.get("customer_profile_image", ""),
                "customer_address": event.get("customer_address", {}),
                "service_id": event["service_id"],
                "service_name": event["service_name"],
                "service_price": event.get("service_price", "0"),
                "timestamp": event.get("timestamp", datetime.now().isoformat())
            }))
            logger.info(f"Booking request sent to barber with complete details")
        except Exception as e:
            logger.error(f"Error sending booking request: {e}")

    async def booking_accepted(self, event):
        """Send booking acceptance to customer"""
        try:
            await self.send(text_data=json.dumps({
                "type": "booking_accepted",
                "barber_id": event["barber_id"],
                "barber_name": event["barber_name"],
                "barber_phone": event["barber_phone"],
                "barber_profile_image": event.get("barber_profile_image", ""),
                "service_id": event["service_id"],
                "service_name": event["service_name"],
                "service_price": event["service_price"],
            }))
            logger.info(f"Booking acceptance sent to customer")
        except Exception as e:
            logger.error(f"Error sending booking acceptance: {e}")

    async def no_barbers_available(self, event):
        """Send no barbers available message to customer"""
        try:
            await self.send(text_data=json.dumps({
                "type": "no_barbers_available",
                "message": event["message"]
            }))
            logger.info(f"No barbers available message sent to customer")
        except Exception as e:
            logger.error(f"Error sending no barbers available message: {e}")

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            return User.objects.get(id=user_id)
        except (jwt.InvalidTokenError, User.DoesNotExist) as e:
            logger.error(f"Token validation error: {e}")
            return None

    @database_sync_to_async
    def get_user_details(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return None

    @database_sync_to_async
    def get_service_details(self, service_id):
        try:
            return ServiceModel.objects.get(id=service_id)
        except ServiceModel.DoesNotExist:
            logger.error(f"Service {service_id} not found")
            return None

    @database_sync_to_async
    def get_service_complete_details(self, service_id):
        """Get complete service details"""
        try:
            service = ServiceModel.objects.get(id=service_id)
            return {
                "id": service.id,
                "name": service.name,
                "price": str(service.price),
                "description": getattr(service, 'description', ''),
                "duration": getattr(service, 'duration', ''),
            }
        except ServiceModel.DoesNotExist:
            logger.error(f"Service {service_id} not found")
            return {
                "id": service_id,
                "name": "Unknown Service",
                "price": "0",
                "description": "",
                "duration": "",
            }

    @database_sync_to_async
    def get_customer_complete_details(self, customer_id):
        """Get complete customer details including address"""
        try:
            user = User.objects.get(id=customer_id)
            
            # Get profile image URL
            profile_image = ""
            if user.profileimage:
                profile_image = f"http://localhost:8000{user.profileimage.url}"
            
            # Get default address
            default_address = {}
            try:
                address = Address.objects.filter(user=user, is_default=True).first()
                if address:
                    default_address = {
                        "id": address.id,
                        "name": address.name,
                        "mobile": address.mobile,
                        "building": address.building,
                        "street": address.street,
                        "city": address.city,
                        "district": address.district,
                        "state": address.state,
                        "pincode": address.pincode,
                    }
            except Exception as e:
                logger.error(f"Error getting address for customer {customer_id}: {e}")
            
            # Get user profile for additional details
            profile_data = {}
            try:
                profile = UserProfile.objects.get(user=user)
                profile_data = {
                    "gender": profile.gender,
                    "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
                    "bio": profile.bio,
                }
            except UserProfile.DoesNotExist:
                logger.info(f"No profile found for customer {customer_id}")
            
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone or "",
                "profile_image": profile_image,
                "gender": user.gender or profile_data.get("gender", ""),
                "address": default_address,
                "profile": profile_data,
                "created_at": user.created_at.isoformat(),
            }
            
        except User.DoesNotExist:
            logger.error(f"Customer {customer_id} not found")
            return {
                "id": customer_id,
                "name": "Unknown Customer",
                "email": "",
                "phone": "",
                "profile_image": "",
                "gender": "",
                "address": {},
                "profile": {},
                "created_at": "",
            }

    @database_sync_to_async
    def find_next_barber(self, service_id, exclude_barber_id=None):
        try:
            queryset = User.objects.filter(
                user_type="barber",
                is_online=True,
                is_active=True,
                is_blocked=False,
                barber_services__service_id=service_id,
                barber_services__is_active=True
            )
            
            if exclude_barber_id:
                queryset = queryset.exclude(id=exclude_barber_id)
            
            return queryset.first()
        except Exception as e:
            logger.error(f"Error finding next barber: {e}")
            return None

    @database_sync_to_async
    def update_barber_online_status(self, barber_id, is_online):
        try:
            updated = User.objects.filter(
                id=barber_id,
                user_type="barber"
            ).update(is_online=is_online)
            return updated > 0
        except Exception as e:
            logger.error(f"Error updating barber status: {e}")
            return False