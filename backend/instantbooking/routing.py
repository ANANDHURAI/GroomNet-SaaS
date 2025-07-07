# routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/instant-booking/general/$', consumers.BarberGeneralConsumer.as_asgi()),
    re_path(r'ws/instant-booking/(?P<booking_id>\w+)/$', consumers.InstantBookingConsumer.as_asgi()),
]
