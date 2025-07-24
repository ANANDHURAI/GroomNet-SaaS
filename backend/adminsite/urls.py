from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsersListView, UserDetailView,
    PendingBarbersRequestsView, AllBarbersRequestsView,
    BarberApprovalActionView, BarberDetailsView, BarbersListView,
    BlockingView,
    CategoryViewSet, 
    ServiceViewSet,
    AdminWalletView,
    payment_history_view,
    CouponViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'coupons', CouponViewSet)

urlpatterns = [
    path('customers-list/', UsersListView.as_view(), name='customers-list'),
    path('customers-details/<int:id>/', UserDetailView.as_view(), name='customer-detail'),

    path('barbers-list/', BarbersListView.as_view(), name='barbers-list'),
    path('pending-requests/', PendingBarbersRequestsView.as_view(), name='pending-barber-requests'),
    path('all-requests/', AllBarbersRequestsView.as_view(), name='all-barber-requests'),
    path('approve-barber/', BarberApprovalActionView.as_view(), name='approve-barber'),
    path('barber-details/<int:barber_id>/', BarberDetailsView.as_view(), name='barber-details'),
    path('users-block/<int:id>/', BlockingView.as_view(), name='users-block'),
    path('admin-wallet/', AdminWalletView.as_view(), name='admin-wallet'),
    path('payment-history/', payment_history_view, name='admin-wallet-payment-history'),

    path('', include(router.urls)),
]


