
from django.urls import path
from .views import (
MakingFindingBarberRequest ,
DoggleStatusView,
HandleBarberActions,
ActiveBookingView,
CompletedServiceView,
ExpireInstantBookingView
)

urlpatterns = [
    path('bookings/<int:booking_id>/find-barber/', MakingFindingBarberRequest.as_view()),
    path('working/status/<int:barber_id>/', DoggleStatusView.as_view(), name="DoggleStatusView"),
    path('barber-action/<int:barber_id>/<int:booking_id>/', HandleBarberActions.as_view(), name="barbers-action"),
    path('bookings/<int:booking_id>/expire/', ExpireInstantBookingView.as_view()),
    path('active-booking/<int:barber_id>/', ActiveBookingView.as_view(), name='active-booking'),
    path('complete/service/<int:booking_id>/', CompletedServiceView.as_view(), name="complete-service"),
    
]

