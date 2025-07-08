from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from authservice.models import User
from rest_framework.generics import RetrieveAPIView
from .serializers import UsersListSerializer, BarbersListSerializer ,CategorySerializer, ServiceSerializer,AdminWalletSerializer
from barber_reg.models import BarberRequest
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging
User = get_user_model()
logger = logging.getLogger(__name__)
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListAPIView
from rest_framework.decorators import api_view, permission_classes
from customersite.models import PaymentModel
from .models import ServiceModel, CategoryModel , AdminWallet 


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
                registration_step__in=['documents_uploaded', 'under_review', 'completed']
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

                logger.info(f"Barber request {action}d: User ID {user.id} by admin {request.user.id}")

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


class BarberDetailsView(APIView):
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
        return User.objects.filter(user_type='customer')
    
    
class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UsersListSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
        

class BarbersListView(ListAPIView):
    serializer_class = BarbersListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(user_type='barber', is_verified=True)


class BarberDetailView(RetrieveAPIView):
    serializer_class = UsersListSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return User.objects.filter(user_type='barber')

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
    queryset = ServiceModel.objects.all().order_by('-id')
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


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
            logger.error(f"Error fetching admin wallet: {str(e)}")
            return Response(
                {"error": "Failed to fetch admin wallet", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history_view(request):
    try:
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
            
        payments = PaymentModel.objects.select_related(
            'booking', 
            'booking__customer', 
            'booking__barber', 
            'booking__service', 
            'booking__service__category'
        ).order_by('-created_at')

        history = []
        for pay in payments:
            booking = pay.booking
            history.append({
                'customer': booking.customer.name,
                'barber': booking.barber.name,
                'category': booking.service.category.name,
                'service': booking.service.name,
                'payment_method': pay.payment_method,
                'payment_status': pay.payment_status,
                'service_amount': float(pay.service_amount),
                'platform_fee': float(pay.platform_fee),
                'total_amount': float(pay.total_amount),
                'created_at': pay.created_at,
            })

        return Response({'history': history}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in payment_history_view: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)