
from django.urls import path
from .views import (
MakingFindingBarberRequest ,
DoggleStatusView,
HandleBarberActions,
ActiveBookingView,
CompletedServiceView
)

urlpatterns = [
    path('booking/<int:booking_id>/', MakingFindingBarberRequest.as_view(), name="makeing-find-barbers"),
    path('working/status/<int:barber_id>/', DoggleStatusView.as_view(), name="DoggleStatusView"),
    path('barber-action/<int:barber_id>/<int:booking_id>/', HandleBarberActions.as_view(), name="barbers-action"),
    path('active-booking/<int:barber_id>/', ActiveBookingView.as_view(), name='active-booking'),
    path('complete/service/<int:booking_id>/', CompletedServiceView.as_view(), name="complete-service"),
]

