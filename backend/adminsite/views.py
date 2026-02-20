from customersite.models import Booking, Rating
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Avg, Sum
from .serializers import ComplaintSerializer
from customersite.models import Complaints
from rest_framework import generics
from datetime import datetime, timedelta
from .serializers import (
    CouponSerializer,
    AdminWalletSerializer,
    AdminWalletTransactionSerializer,
    ServiceRequestDetailSerializer,
    ServiceSerializer,
    ServiceRequestSerializer
)
from .models import (
    ServiceModel,
    CategoryModel,
    AdminWallet,
    Coupon,
    AdminWalletTransaction,
    ServiceRequestModel
)
from customersite.models import PaymentModel
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from authservice.models import User
from rest_framework.generics import RetrieveAPIView
from .serializers import UsersListSerializer, BarbersListSerializer, CategorySerializer, ServiceSerializer, AdminWalletSerializer
from barber_reg.models import BarberRequest
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging
User = get_user_model()
logger = logging.getLogger(__name__)


class PendingBarbersRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_full_url(self, request, file_field):
        if file_field:
            return request.build_absolute_uri(file_field.url)
        return None

    def get(self, request):
        try:
            pending_requests = BarberRequest.objects.filter(
                status='pending',
                registration_step='documents_uploaded'
            ).select_related('user').order_by('-created_at')

            data = []
            for req in pending_requests:
                data.append({
                    'id': req.user.id,
                    'name': req.user.name,
                    'email': req.user.email,
                    'phone': req.user.phone,
                    'gender': req.user.gender,
                    'status': req.status,
                    'request_date': req.created_at,
                    'licence': self.get_full_url(request, req.licence),
                    'certificate': self.get_full_url(request, req.certificate),
                    'profile_image': self.get_full_url(request, req.profile_image),
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching pending requests: {str(e)}")
            return Response({
                'error': 'Failed to fetch pending requests'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllBarbersRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_full_url(self, request, file_field):
        if file_field:
            return request.build_absolute_uri(file_field.url)
        return None

    def get(self, request):
        try:
            all_requests = BarberRequest.objects.filter(
                registration_step__in=[
                    'documents_uploaded', 'under_review', 'completed']
            ).select_related('user').order_by('-created_at')

            data = []
            for req in all_requests:
                data.append({
                    'id': req.user.id,
                    'name': req.user.name,
                    'email': req.user.email,
                    'phone': req.user.phone,
                    'gender': req.user.gender,
                    'status': req.status,
                    'request_date': req.created_at,
                    'licence': self.get_full_url(request, req.licence),
                    'certificate': self.get_full_url(request, req.certificate),
                    'profile_image': self.get_full_url(request, req.profile_image),
                    'admin_comment': req.admin_comment,
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching all requests: {str(e)}")
            return Response({
                'error': 'Failed to fetch requests'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BarberApprovalActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_id = request.data.get('user_id')
        action = request.data.get('action')
        comment = request.data.get('comment', '')

        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if action not in ['approve', 'reject']:
            return Response({
                'error': 'action must be either "approve" or "reject"'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():

                user = get_object_or_404(User, id=user_id, user_type='barber')

                try:
                    barber_request = user.barber_request
                except BarberRequest.DoesNotExist:
                    return Response({
                        'error': 'Barber request not found for this user'
                    }, status=status.HTTP_404_NOT_FOUND)

                if barber_request.status != 'pending':
                    return Response({
                        'error': f'Request has already been {barber_request.status}'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if action == 'approve':
                    barber_request.status = 'approved'
                    user.is_verified = True
                    user.save()
                    barber_request.registration_step = 'completed'

                elif action == 'reject':
                    barber_request.status = 'rejected'
                    barber_request.registration_step = 'under_review'
                    user.is_verified = False
                    user.save()

                barber_request.admin_comment = comment
                barber_request.save()

                logger.info(
                    f"Barber request {action}d: User ID {user.id} by admin {request.user.id}")

                return Response({
                    'message': f'Barber application {action}d successfully',
                    'user_id': user.id,
                    'new_status': barber_request.status,
                    'action': action
                }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'error': 'Barber user not found'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error processing barber {action}: {str(e)}")
            return Response({
                'error': f'Failed to {action} barber request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerificationBarberDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_full_url(self, request, file_field):
        if file_field:
            return request.build_absolute_uri(file_field.url)
        return None

    def get(self, request, barber_id):
        try:
            user = get_object_or_404(User, id=barber_id, user_type='barber')

            try:
                barber_request = user.barber_request
            except BarberRequest.DoesNotExist:
                return Response({
                    'error': 'Barber request not found'
                }, status=status.HTTP_404_NOT_FOUND)

            data = {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'gender': user.gender,
                'status': barber_request.status,
                'request_date': barber_request.created_at,
                'licence': self.get_full_url(request, barber_request.licence),
                'certificate': self.get_full_url(request, barber_request.certificate),
                'profile_image': self.get_full_url(request, barber_request.profile_image),
                'admin_comment': barber_request.admin_comment,
                'registration_step': barber_request.registration_step,
                'created_at': barber_request.created_at,
                'updated_at': barber_request.updated_at,
            }

            return Response(data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'error': 'Barber not found'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error fetching barber details: {str(e)}")
            return Response({
                'error': 'Failed to fetch barber details'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UsersListView(ListAPIView):
    serializer_class = UsersListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(user_type='customer')
        search = self.request.query_params.get('search')
        is_active = self.request.query_params.get('is_active')
        is_blocked = self.request.query_params.get('is_blocked')

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        if is_active in ['true', 'false']:
            queryset = queryset.filter(is_active=(is_active == 'true'))

        if is_blocked in ['true', 'false']:
            queryset = queryset.filter(is_blocked=(is_blocked == 'true'))

        return queryset.distinct()


class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UsersListSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'


class BarbersListView(ListAPIView):
    serializer_class = BarbersListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(
            user_type='barber',
            is_verified=True  
        )

        search = self.request.query_params.get('search')
        is_active = self.request.query_params.get('is_active')
        is_blocked = self.request.query_params.get('is_blocked')

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        if is_active in ['true', 'false']:
            queryset = queryset.filter(is_active=(is_active == 'true'))

        if is_blocked in ['true', 'false']:
            queryset = queryset.filter(is_blocked=(is_blocked == 'true'))

        return queryset.distinct()



class BarberDetailView(RetrieveAPIView):
    serializer_class = UsersListSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'barber_id'

    def get_queryset(self):
        return User.objects.filter(user_type='barber', is_verified=True)


class BlockingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            user = User.objects.get(id=id)

            user.is_blocked = not user.is_blocked
            user.is_active = not user.is_active
            user.save()
            return Response({'message': 'User status updated successfully.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class CategoryViewSet(ModelViewSet):
    queryset = CategoryModel.objects.all().order_by('-id')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class ServiceViewSet(ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ServiceModel.objects
            .select_related('category')  
            .filter(category__is_blocked=False)
            .order_by('-id')
        )

class AdminWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            admin_wallet, created = AdminWallet.objects.get_or_create(
                id=1,
                defaults={'total_earnings': 0}
            )

            if created:
                logger.info("Created new admin wallet")

            serializer = AdminWalletSerializer(admin_wallet)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "Failed to fetch admin wallet", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminWalletTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            period = request.query_params.get('period', 'all')
            transactions = AdminWalletTransaction.objects.all()
            if period != 'all':
                now = timezone.now()

                if period == 'today':
                    start_date = now.replace(
                        hour=0, minute=0, second=0, microsecond=0)
                    end_date = start_date + timedelta(days=1)

                elif period == 'week':
                    days_since_monday = now.weekday()
                    start_date = (now - timedelta(days=days_since_monday)).replace(
                        hour=0, minute=0, second=0, microsecond=0
                    )
                    end_date = start_date + timedelta(days=7)

                elif period == 'month':
                    start_date = now.replace(
                        day=1, hour=0, minute=0, second=0, microsecond=0)

                    if now.month == 12:
                        end_date = now.replace(year=now.year + 1, month=1, day=1,
                                               hour=0, minute=0, second=0, microsecond=0)
                    else:
                        end_date = now.replace(month=now.month + 1, day=1,
                                               hour=0, minute=0, second=0, microsecond=0)

                else:
                    start_date = None
                    end_date = None

                if start_date and end_date:
                    transactions = transactions.filter(
                        created_at__gte=start_date,
                        created_at__lt=end_date
                    )

            transactions = transactions.order_by('-created_at')
            serializer = AdminWalletTransactionSerializer(
                transactions, many=True)
            total_income = 0
            total_expense = 0

            for txn in transactions:
                is_expense = ('payout' in txn.note.lower() or
                              'refund' in txn.note.lower())
                amount = abs(txn.amount)

                if is_expense:
                    total_expense += amount
                else:
                    total_income += amount

            response_data = {
                'history': serializer.data,
                'statistics': {
                    'total_income': total_income,
                    'total_expense': total_expense,
                    'net_amount': total_income - total_expense,
                    'transaction_count': len(serializer.data),
                    'period': period
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": "Failed to fetch transaction history",
                    "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CouponViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer


class AdminComplaintListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Complaints.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer


class AdminComplaintStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            complaint = Complaints.objects.get(id=pk)
        except Complaints.DoesNotExist:
            return Response({"detail": "Complaint not found"}, status=404)

        new_status = request.data.get('complaint_status')

        if new_status not in dict(Complaints.COMPLAINT_STATUS):
            return Response({"detail": "Invalid status"}, status=400)

        complaint.complaint_status = new_status
        complaint.save()

        return Response({"success": True, "new_status": new_status}, status=200)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)

        total_users = User.objects.count()
        total_barbers = User.objects.filter(user_type='barber').count()
        total_customers = User.objects.filter(user_type='customer').count()
        total_complaints = Complaints.objects.count()
        total_categories = CategoryModel.objects.count()
        total_services = ServiceModel.objects.count()

        total_revenue = PaymentModel.objects.filter(payment_status='SUCCESS').aggregate(
            total=Sum('platform_fee')
        )['total'] or 0

        top_booked_services = (
            Booking.objects.values('service__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        top_rating_barbers = (
            Rating.objects.values('barber__id', 'barber__name')
            .annotate(avg_rating=Avg('rating'), review_count=Count('id'))
            .order_by('-avg_rating')[:5]
        )

        top_customers = (
            Booking.objects.values('customer__id', 'customer__name')
            .annotate(booking_count=Count('id'))
            .order_by('-booking_count')[:5]
        )

        admin_wallet = AdminWallet.objects.first()

        data = {
            'totals': {
                'users': total_users,
                'barbers': total_barbers,
                'customers': total_customers,
                'complaints': total_complaints,
                'categories': total_categories,
                'services': total_services,
                'platform_earnings': total_revenue,
                'admin_wallet_balance': admin_wallet.total_earnings if admin_wallet else 0
            },
            'top_booked_services': top_booked_services,
            'top_rating_barbers': top_rating_barbers,
            'top_customers': top_customers,
        }
        return Response(data)


class AdminServiceRequestListView(generics.ListAPIView):
    queryset = ServiceRequestModel.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.user_type == 'admin':
            return ServiceRequestModel.objects.none()

        queryset = ServiceRequestModel.objects.all()
        status_filter = self.request.query_params.get('status', None)
        category_filter = self.request.query_params.get('category', None)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)

        return queryset


class AdminServiceRequestDetailView(generics.RetrieveAPIView):
    queryset = ServiceRequestModel.objects.all()
    serializer_class = ServiceRequestDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.user_type == 'admin':
            return ServiceRequestModel.objects.none()
        return ServiceRequestModel.objects.all()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_service_request(request, request_id):

    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    service_request = get_object_or_404(ServiceRequestModel, id=request_id)

    if service_request.status != 'pending':
        return Response(
            {'error': 'Only pending requests can be approved'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        admin_notes = request.data.get('admin_notes', '')
        service = service_request.approve(request.user, admin_notes)

        return Response({
            'message': 'Service request approved successfully',
            'service_id': service.id,
            'request_status': service_request.status
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to approve request: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_service_request(request, request_id):
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    service_request = get_object_or_404(ServiceRequestModel, id=request_id)

    if service_request.status != 'pending':
        return Response(
            {'error': 'Only pending requests can be rejected'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        admin_notes = request.data.get('admin_notes', '')
        service_request.reject(request.user, admin_notes)

        return Response({
            'message': 'Service request rejected',
            'request_status': service_request.status
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to reject request: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_service_request_stats(request):
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    stats = {
        'total': ServiceRequestModel.objects.count(),
        'pending': ServiceRequestModel.objects.filter(status='pending').count(),
        'approved': ServiceRequestModel.objects.filter(status='approved').count(),
        'rejected': ServiceRequestModel.objects.filter(status='rejected').count(),
        'recent_requests': ServiceRequestModel.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
    }
    return Response(stats)
