from adminsite.models import CategoryModel, ServiceModel, ServiceRequestModel
from django.db.models import Sum
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status
from customersite.models import Booking, Rating
from django.db.models import Avg, Count
from django.utils.timezone import localtime
from adminsite.serializers import ServiceRequestSerializer
from .serializers import BarberWalletSerializer
from .models import BarberWallet
from rest_framework import status
import logging
from django.db.models import ProtectedError
from django.db import transaction
from .serializers import BarberSlotSerializer
from .models import BarberSlot
from .models import BarberService
from rest_framework.decorators import action
from rest_framework import viewsets, status
from adminsite.serializers import CategorySerializer, ServiceSerializer
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import PortfolioSerializer, BarberServiceSerializer
from .models import Portfolio

logger = logging.getLogger(__name__)


class BarberDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type != 'barber':
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'message': 'Welcome to Barber Dashboard',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'user_type': user.user_type
            }
        }, status=status.HTTP_200_OK)


class BarberPortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            portfolio = Portfolio.objects.get(user=request.user)
            serializer = PortfolioSerializer(portfolio)
            return Response(serializer.data)
        except Portfolio.DoesNotExist:
            return Response({"detail": "Portfolio not created yet."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        portfolio, _ = Portfolio.objects.get_or_create(user=request.user)
        serializer = PortfolioSerializer(
            portfolio, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BarberServiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BarberServiceSerializer

    def get_queryset(self):
        return BarberService.objects.filter(barber=self.request.user, is_active=True)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = CategoryModel.objects.filter(is_blocked=False)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def services_by_category(self, request):
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response({'error': 'category_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        services = ServiceModel.objects.filter(
            category_id=category_id, is_blocked=False)

        selected_service_ids = BarberService.objects.filter(
            barber=request.user,
            is_active=True,
            service__category_id=category_id
        ).values_list('service_id', flat=True)

        available_services = services.exclude(id__in=selected_service_ids)

        serializer = ServiceSerializer(available_services, many=True)
        return Response({
            'services': serializer.data,
            'category': CategorySerializer(get_object_or_404(CategoryModel, id=category_id)).data
        })

    @action(detail=False, methods=['post'])
    def add_service(self, request):
        service_id = request.data.get('service_id')
        if not service_id:
            return Response({'error': 'service_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = get_object_or_404(
            ServiceModel, id=service_id, is_blocked=False)

        if BarberService.objects.filter(barber=request.user, service=service, is_active=True).exists():
            return Response({'error': 'Service already added'}, status=status.HTTP_400_BAD_REQUEST)

        barber_service, created = BarberService.objects.get_or_create(
            barber=request.user,
            service=service,
            defaults={'is_active': True}
        )

        if not created:
            barber_service.is_active = True
            barber_service.save()

        serializer = BarberServiceSerializer(barber_service)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def remove_service(self, request, pk=None):
        barber_service = get_object_or_404(
            BarberService, id=pk, barber=request.user)
        barber_service.is_active = False
        barber_service.save()
        return Response({'message': 'Service removed successfully'})

    @action(detail=False, methods=['get'])
    def my_services(self, request):
        services = self.get_queryset()
        serializer = BarberServiceSerializer(services, many=True)

        total_price = sum(float(service.service.price) for service in services)
        total_duration = sum(
            service.service.duration_minutes for service in services)

        return Response({
            'services': serializer.data,
            'total_price': total_price,
            'total_duration': total_duration,
            'count': services.count()
        })


class BarberSlotViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        date_filter = request.query_params.get('date')

        slots = BarberSlot.objects.filter(barber=request.user)

        if date_filter:
            slots = slots.filter(date=date_filter)

        slots = slots.order_by('date', 'start_time')

        serializer = BarberSlotSerializer(slots, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        slot = get_object_or_404(BarberSlot, id=pk, barber=request.user)
        serializer = BarberSlotSerializer(slot)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create-slot')
    def create_slot(self, request):
        date = request.data.get('date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')

        if not all([date, start_time, end_time]):
            return Response({
                'error': 'All fields are required',
                'required_fields': ['date', 'start_time', 'end_time']
            }, status=status.HTTP_400_BAD_REQUEST)

        if end_time == "24:00:00":  # this code for when book 11-12 pm slot
            end_time = "23:59:59"  # i get the error because it connected to next day

        if BarberSlot.objects.filter(
            barber=request.user,
            date=date,
            start_time=start_time,
            end_time=end_time
        ).exists():
            return Response({
                'error': f'Slot already exists for {date} at {start_time}-{end_time}'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            slot = BarberSlot.objects.create(
                barber=request.user,
                date=date,
                start_time=start_time,
                end_time=end_time
            )
            serializer = BarberSlotSerializer(slot)
            return Response({
                'message': f'Slot created successfully for {date}',
                'slot': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating slot: {str(e)}")
            return Response({
                'error': f'Failed to create slot: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='cancel')
    def cancel_slot(self, request, pk=None):
        try:
            slot = get_object_or_404(BarberSlot, id=pk, barber=request.user)

            if slot.is_booked:
                return Response({
                    'error': 'Slot is already booked by a customer. Cannot cancel.'
                }, status=status.HTTP_403_FORBIDDEN)

            if hasattr(slot, 'barberslotbooking_set') and slot.barberslotbooking_set.exists():
                return Response({
                    'error': 'Cannot delete slot with existing bookings.'
                }, status=status.HTTP_403_FORBIDDEN)

            slot_info = f"{slot.date} at {slot.start_time}-{slot.end_time}"

            with transaction.atomic():
                slot.delete()

            return Response({
                'message': f'Slot cancelled successfully for {slot_info}.'
            }, status=status.HTTP_200_OK)

        except ProtectedError as e:
            logger.error(f"Protected error when deleting slot {pk}: {str(e)}")
            return Response({
                'error': 'Cannot delete slot due to existing related records.'
            }, status=status.HTTP_409_CONFLICT)

        except Exception as e:
            logger.error(f"Unexpected error when deleting slot {pk}: {str(e)}")
            return Response({
                'error': f'An error occurred while cancelling the slot: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='by-date-range')
    def get_slots_by_date_range(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({
                'error': 'Both start_date and end_date are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        slots = BarberSlot.objects.filter(
            barber=request.user,
            date__range=[start_date, end_date]
        ).order_by('date', 'start_time')

        serializer = BarberSlotSerializer(slots, many=True)
        return Response(serializer.data)


class BarberAppointments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'barber':
            return Response({"detail": "Unauthorized access."}, status=403)

        appointments = Booking.objects.filter(
            booking_type='SCHEDULE_BOOKING',
            barber=request.user,
            status__in=['PENDING', 'CONFIRMED',]
        )

        data = []
        for booking in appointments:
            time_str = f"{booking.slot.start_time} - {booking.slot.end_time}" if booking.slot else "N/A"
            date_str = booking.slot.date.strftime(
                '%Y-%m-%d') if booking.slot else "N/A"

            data.append({
                'id': booking.id,
                'customer_name': booking.customer.name,
                'time': time_str,
                'date': date_str,
                'address': f"{booking.address.street}, {booking.address.city}, {booking.address.pincode}",
                'price': float(booking.total_amount),
                'status': booking.status,
                'phone': booking.customer.phone,
                'service': booking.service.name,
                'bookingType': booking.booking_type,

            })

        return Response(data)




class CompletedAppointments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'barber':
            return Response({"detail": "Unauthorized access."}, status=403)

        appointments = Booking.objects.filter(
            barber=request.user,
            status='COMPLETED'
        ).order_by('-completed_at')

        data = []
        for booking in appointments:
            if booking.completed_at:
                completed_time = localtime(booking.completed_at)
                date_str = completed_time.strftime('%Y-%m-%d')
                time_str = completed_time.strftime('%I:%M %p')
            else:
                date_str = "N/A"
                time_str = "N/A"

            data.append({
                'id': booking.id,
                'customer_name': booking.customer.name,
                'date': date_str,
                'time': time_str,
                'address': f"{booking.address.street}, {booking.address.city}, {booking.address.pincode}",
                'price': float(booking.total_amount),
                'phone': booking.customer.phone,
                'service': booking.service.name,
                'bookingType': booking.booking_type,
            })

        return Response(data)





class BarberWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'user_type') or request.user.user_type != 'barber':
            return Response({'detail': 'Access denied'}, status=403)

        wallet, _ = BarberWallet.objects.get_or_create(barber=request.user)

        today = now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)

        transactions = wallet.transactions.all()

        day_total = transactions.filter(created_at__date=today).aggregate(
            total=Sum('amount'))['total'] or 0
        week_total = transactions.filter(created_at__date__gte=start_of_week).aggregate(
            total=Sum('amount'))['total'] or 0
        month_total = transactions.filter(created_at__date__gte=start_of_month).aggregate(
            total=Sum('amount'))['total'] or 0

        serializer = BarberWalletSerializer(wallet)
        data = serializer.data
        data.update({
            'day_total': day_total,
            'week_total': week_total,
            'month_total': month_total,
        })

        return Response(data)


class BarberDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.user_type != 'barber':
            return Response({'error': 'Unauthorized'}, status=403)

        bookings = Booking.objects.filter(barber=user)
        total_bookings = bookings.count()
        completed_bookings = bookings.filter(status='COMPLETED').count()
        cancelled_bookings = bookings.filter(status='CANCELLED').count()

        wallet = BarberWallet.objects.filter(barber=user).first()
        wallet_balance = wallet.balance if wallet else 0

        rating_info = Rating.objects.filter(barber=user).aggregate(
            avg_rating=Avg('rating'),
            total_reviews=Count('id')
        )
        average_rating = rating_info['avg_rating'] or 0
        total_reviews = rating_info['total_reviews']

        profile_image_url = request.build_absolute_uri(
            user.profileimage.url) if user.profileimage else None

        return Response({
            'total_bookings': total_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'wallet_balance': wallet_balance,
            'average_rating': round(average_rating, 1),
            'total_reviews': total_reviews,
            'profile_image': profile_image_url,
        })


class ServiceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ServiceRequestModel.objects.filter(barber=self.request.user)

    def perform_create(self, serializer):
        serializer.save(barber=self.request.user)


class ServiceRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ServiceRequestModel.objects.filter(barber=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != 'pending':
            return Response(
                {'error': 'Cannot modify request that has been processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != 'pending':
            return Response(
                {'error': 'Cannot delete request that has been processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_barber_categories(request):
    categories = CategoryModel.objects.filter(is_blocked=False)
    category_data = [
        {
            'id': cat.id,
            'name': cat.name,
            'image': cat.image.url if cat.image else None
        }
        for cat in categories
    ]
    return Response(category_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_request_stats(request):
    user_requests = ServiceRequestModel.objects.filter(barber=request.user)
    stats = {
        'total': user_requests.count(),
        'pending': user_requests.filter(status='pending').count(),
        'approved': user_requests.filter(status='approved').count(),
        'rejected': user_requests.filter(status='rejected').count(),
    }
    return Response(stats)
