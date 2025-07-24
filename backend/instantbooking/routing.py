from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/instant-booking/(?P<barber_id>\d+)/$", consumers.BookingFlowConsumer.as_asgi()),
]

