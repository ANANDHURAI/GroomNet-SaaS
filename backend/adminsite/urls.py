from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsersListView, UserDetailView,
    PendingBarbersRequestsView, AllBarbersRequestsView,
    BarberApprovalActionView, BarberDetailView, BarbersListView,
    BlockingView,
    CategoryViewSet, 
    ServiceViewSet,
    AdminWalletView,
    CouponViewSet,
    AdminComplaintListView,
    AdminComplaintStatusUpdateView,
    AdminDashboardView,
    AdminWalletTransactionHistoryView,
    admin_service_request_stats,
    reject_service_request,
    approve_service_request,
    AdminServiceRequestDetailView,
    AdminServiceRequestListView,
    VerificationBarberDetailsView
    
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
    path('barbers-details/<int:barber_id>/', BarberDetailView.as_view(), name='barber-details'),
    path('verification-barber-details/<int:barber_id>/', VerificationBarberDetailsView.as_view(), name='barber-details'),
    
    path('users-block/<int:id>/', BlockingView.as_view(), name='users-block'),
    path('admin-wallet/', AdminWalletView.as_view(), name='admin-wallet'),
    path('admin-wallet/transactions/', AdminWalletTransactionHistoryView.as_view(), name='admin-wallet-transactions'),
    path('complaints/', AdminComplaintListView.as_view(), name='complaint_list'),
    path('complaints/<int:pk>/update-status/', AdminComplaintStatusUpdateView.as_view(), name='complaint_status_update'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('service-requests/', AdminServiceRequestListView.as_view(), name='admin-service-requests'),
    path('service-requests/<int:pk>/', AdminServiceRequestDetailView.as_view(), name='admin-service-request-detail'),
    path('service-requests/<int:request_id>/approve/', approve_service_request, name='admin-approve-service-request'),
    path('service-requests/<int:request_id>/reject/', reject_service_request, name='admin-reject-service-request'),
    path('service-request/stats/', admin_service_request_stats, name='admin-service-request-stats'),
    path('', include(router.urls)),
]



