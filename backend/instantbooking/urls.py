
from django.urls import path
from .views import (
MakingFindingBarberRequest ,
DoggleStatusView
)

urlpatterns = [
    path('booking/<int:booking_id>/', MakingFindingBarberRequest.as_view(), name="makeing-find-barbers"),
    path('working/status/<int:barber_id>/', DoggleStatusView.as_view(), name="DoggleStatusView"),
]

