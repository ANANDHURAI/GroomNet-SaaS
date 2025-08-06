
from django.urls import path , include
from .views import (
BarberDashboard,
BarberPortfolioView,
BarberServiceViewSet,
BarberSlotViewSet , 
BarberAppointments,
CompletedAppointments,
BarberWalletView,
BarberDashboardView,
get_barber_categories,
ServiceRequestListCreateView,
ServiceRequestDetailView,
service_request_stats
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'barber-services', BarberServiceViewSet, basename='barber-services')
router.register(r'barber-slots', BarberSlotViewSet, basename='barber-slots')

urlpatterns = [
    path('barber-dash/', BarberDashboard.as_view(), name='barber-dash'),
    path('barber-portfolio/', BarberPortfolioView.as_view(), name='barber-portfolio'),
    path('barber-appointments/', BarberAppointments.as_view(), name='barber-appointments'),
    path('completed-barber-appointments/', CompletedAppointments.as_view(), name='CompletedAppointments'),
    path('barber/wallet/', BarberWalletView.as_view(), name='barber-wallet'),
    path('dashboard/barber/', BarberDashboardView.as_view(), name='barber-dashboard'),
    
    path('service-requests/', ServiceRequestListCreateView.as_view(), name='barber-service-requests'),
    path('service-requests/<int:pk>/', ServiceRequestDetailView.as_view(), name='barber-service-request-detail'),
    path('service-request/categories/', get_barber_categories, name='barber-service-request-categories'),
    path('service-request/stats/', service_request_stats, name='barber-service-request-stats'),
    path('', include(router.urls)),
    
]
