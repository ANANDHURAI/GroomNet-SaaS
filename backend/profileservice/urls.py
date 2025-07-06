from django.urls import path
from .views import UserProfileView,AddressListView,BarberProfileView

urlpatterns = [
    path('user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('barber-profile/<int:pk>/', BarberProfileView.as_view(), name='barber-profile'),
    path('user-profile/<int:user_id>/',UserProfileView.as_view(), name='user-profile-detail'),
    path('addresses/', AddressListView.as_view(), name='address-list'),
    
]
