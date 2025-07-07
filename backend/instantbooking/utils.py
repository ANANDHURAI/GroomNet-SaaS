#utils.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_barbers_about_booking(booking):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "general_room", 
        {
            "type": "send_booking_request",
            "booking_id": booking.id,
            "customer_name": booking.customer.name,
            "customer_location": booking.customer.address,
            "service_name": booking.service.name,
            "duration": booking.service.duration,
            "price": booking.service.price,
            "message": "New booking request"
        }
    )
