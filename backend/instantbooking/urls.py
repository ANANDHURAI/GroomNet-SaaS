# instantbooking/urls.py
from django.urls import path
from .views import (
    FindNearbyBarbers, 
    BarberOnlineStatus,
)

urlpatterns = [
    path("find-nearby-barbers/", FindNearbyBarbers.as_view(), name="find_nearby_barbers"),
    path("barber-online-status/", BarberOnlineStatus.as_view(), name="barber_online_status"),
        # path("barber-requests/", BarberBookingRequests.as_view(), name="barber_booking_requests"),
    # path("customer-booking-status/", CustomerBookingStatus.as_view(), name="customer_booking_status"),
    # path("cancel-booking/", CancelBooking.as_view(), name="cancel_booking"),

]