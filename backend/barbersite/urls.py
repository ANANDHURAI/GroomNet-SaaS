
from django.urls import path , include
from .views import BarberDashboard,BarberPortfolioView,BarberServiceViewSet,BarberSlotViewSet , BarberAppointments,CompletedAppointments
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'barber-services', BarberServiceViewSet, basename='barber-services')
router.register(r'barber-slots', BarberSlotViewSet, basename='barber-slots')

urlpatterns = [
    path('barber-dash/', BarberDashboard.as_view(), name='barber-dash'),
    path('barber-portfolio/', BarberPortfolioView.as_view(), name='barber-portfolio'),
    path('barber-appointments/', BarberAppointments.as_view(), name='barber-appointments'),
    path('completed-barber-appointments/', CompletedAppointments.as_view(), name='CompletedAppointments'),
    path('', include(router.urls)),
    
]
