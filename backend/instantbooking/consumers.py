from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from django.conf import settings
from urllib.parse import parse_qs
import json
User = get_user_model()
import logging
logger = logging.getLogger("django")


class EntireBookingFlowConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
        token = self.get_token_from_scope()
        user = await self.authenticate_user(token)

        if user is None:
            await self.close (code=4001)
            return 
        
        self.user = user
        if self.user.user_type == "barber":
            group_name = f'barber_{self.user.id}'
        else:
            group_name = f'customer_{self.user.id}'

        logger.info(f"{self.user.name} joined group: {group_name}")
        await self.channel_layer.group_add(group_name , self.channel_name)
        await self.accept()
        
    async def disconnect(self, close_code):
        if hasattr(self, 'user'):
            if self.user.user_type == "barber":
                group_name = f'barber_{self.user.id}'
            else:
                group_name = f'customer_{self.user.id}'

            await self.channel_layer.group_discard(group_name, self.channel_name)


    async def new_booking_request(self , event):
        await self.send(text_data=json.dumps({
            "type": "new_booking_request",
            "booking_id": event["booking_id"],
            "service": event["service"],
            "customer_name": event["customer_name"],
            "address": event["address"],
            "total_amount": event["total_amount"]
        }))

    async def authenticate_user(self, token):
        try:
            payload = jwt_decode(token , settings.SECRET_KEY , algorithms=["HS256"])
            user_id = payload.get('user_id')
            user = await database_sync_to_async(User.objects.get)(id = user_id)
            return user if user.is_active  else None
        except Exception:
            return None

    def get_token_from_scope(self):
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get('token',[None])[0]
        return token
    
       

