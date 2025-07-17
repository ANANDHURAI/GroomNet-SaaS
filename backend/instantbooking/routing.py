from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/instant-booking/(?P<booking_id>\d+)/$", consumers.EntireBookingFlowConsumer.as_asgi()),
]
