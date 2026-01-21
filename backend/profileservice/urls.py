from django.urls import path
from .views import UserProfileView,BarberProfileView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('barber-profile/<int:pk>/', BarberProfileView.as_view(), name='barber-profile'),
    path('', include(router.urls)),
]
