
from django.urls import path
from .views import BookingAcceptView, BookingRejectView, MakeingBookingRequestView, BookingStatusView, BarberOnlineStatusView

urlpatterns = [
    path('booking/<int:booking_id>/details/', MakeingBookingRequestView.as_view(), name="booking-details"),
    path('booking/<int:booking_id>/accept/', BookingAcceptView.as_view(), name="instant-booking-accept"),
    path('booking/<int:booking_id>/reject/', BookingRejectView.as_view(), name="instant-booking-reject"),
    path('booking/<int:booking_id>/status/', BookingStatusView.as_view(), name="booking-status"),
    path('barber/status/', BarberOnlineStatusView.as_view(), name="barber-status"),
]