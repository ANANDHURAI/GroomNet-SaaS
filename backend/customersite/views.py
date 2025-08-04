from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status ,generics
from .serializer import (
HomeSerializer , 
CategorySerializer, 
ServiceSerializer , 
BarberSerializer , 
AvailableSlotSerializer,
AddressSerializer,
BookingCreateSerializer,
CustomerWalletSerializer,
LocationSerializer,
RatingSerializer,
ComplaintSerializer
)
from adminsite.models import CategoryModel , ServiceModel,AdminWallet,AdminWalletTransaction
import logging
from barbersite.models import BarberSlot, BarberService
from django.contrib.auth.models import User
from django.utils import timezone
from profileservice.models import Address , UserProfile
from profileservice.serializers import AddressSerializer
from authservice.models import User
from.models import Booking ,CustomerWallet ,Complaints , CustomerWalletTransaction
logger = logging.getLogger(__name__)
from django.utils import timezone
from datetime import datetime
from django.shortcuts import get_object_or_404
from decimal import Decimal
from django.db import transaction
from rest_framework import generics, permissions,serializers
from barbersite.models import BarberWallet, WalletTransaction


class Home(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = CategoryModel.objects.filter(is_blocked=False).order_by('-id')
        services = ServiceModel.objects.filter(is_blocked=False).order_by('-id')

        data = {
            'greeting_message': f'Hello, welcome {request.user.name}!',
            'categories': categories,
            'services': services,
        }
        serializer = HomeSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserLocationUpdateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LocationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_location(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.address and user_profile.address.latitude and user_profile.address.longitude:
            return Response({
                'has_location': True,
                'latitude': user_profile.address.latitude,
                'longitude': user_profile.address.longitude,
                'address': {
                    'building': user_profile.address.building,
                    'street': user_profile.address.street,
                    'city': user_profile.address.city,
                    'district': user_profile.address.district,
                    'state': user_profile.address.state,
                    'pincode': user_profile.address.pincode
                }
            })
        else:
            return Response({'has_location': False})
    except UserProfile.DoesNotExist:
        return Response({'has_location': False})

class CategoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CategoryModel.objects.filter(is_blocked=False)
    serializer_class = CategorySerializer


class ServiceListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer
    
    def get_queryset(self):
        category_id = self.request.query_params.get('category_id')
        queryset = ServiceModel.objects.filter(is_blocked=False)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


class BarberListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BarberSerializer
    
    def get_queryset(self):
        service_id = self.request.query_params.get('service_id')
        if not service_id:
            return User.objects.none()
        
        try:
            barber_ids = BarberService.objects.filter(
                service_id=service_id,
                is_active=True
            ).values_list('barber_id', flat=True)
            
            return User.objects.filter(
                id__in=barber_ids,
                user_type='barber',
                is_active=True,
                is_blocked=False
            )
        except Exception as e:
            print(f"Error in BarberListView: {e}")
            return User.objects.none()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_dates(request):
    barber_id = request.query_params.get('barber_id')
    if not barber_id:
        return Response({"error": "barber_id is required"}, status=400)

    dates = BarberSlot.objects.filter(
        barber_id=barber_id,
        is_booked=False,
        date__gte=timezone.now().date()
    ).values_list('date', flat=True).distinct().order_by('date')
    
    return Response({"available_dates": list(dates)})




from datetime import timedelta, datetime
from django.utils.timezone import make_aware, is_naive, now
from django.utils import timezone

class AvailableSlotListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailableSlotSerializer

    def get_queryset(self):
        barber_id = self.request.query_params.get('barber_id')
        date_str = self.request.query_params.get('date')

        if not barber_id or not date_str:
            return BarberSlot.objects.none()

        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        current_time = timezone.now()

        cutoff_time = current_time - timedelta(hours=12)
        
        instant_bookings = Booking.objects.filter(
            barber_id=barber_id,
            status__in=["CONFIRMED", "PENDING"],
            booking_type="INSTANT_BOOKING",
            created_at__gte=cutoff_time
        )

        booking_ranges = []
        for booking in instant_bookings:
            if booking.service_started_at:
                start_dt = booking.service_started_at
            else:
                start_dt = booking.created_at
          
            if is_naive(start_dt):
                start_dt = make_aware(start_dt)

            duration = timedelta(minutes=booking.service.duration_minutes)
            end_dt = start_dt + duration
         
            booking_date = start_dt.date()
            end_date = end_dt.date()
            
            if booking_date == date_obj or end_date == date_obj:
                booking_ranges.append((start_dt, end_dt))

        slots = BarberSlot.objects.filter(
            barber_id=barber_id,
            date=date_obj,
            is_booked=False
        )

        if date_obj == current_time.date():
            buffer_time = current_time + timedelta(minutes=30)
            current_time_only = buffer_time.time()
            slots = slots.filter(start_time__gt=current_time_only)

        def slot_conflicts_with_booking(slot, booking_start, booking_end):
            slot_start = datetime.combine(slot.date, slot.start_time)
            slot_end = datetime.combine(slot.date, slot.end_time)
            
            if is_naive(slot_start):
                slot_start = make_aware(slot_start)
            if is_naive(slot_end):
                slot_end = make_aware(slot_end)

            buffer = timedelta(minutes=15)
            booking_start_buffered = booking_start - buffer
            booking_end_buffered = booking_end + buffer
          
            return slot_start < booking_end_buffered and booking_start_buffered < slot_end

        available_slots = []
        for slot in slots:
            has_conflict = False
            for booking_start, booking_end in booking_ranges:
                if slot_conflicts_with_booking(slot, booking_start, booking_end):
                    has_conflict = True
                    break
            
            if not has_conflict:
                available_slots.append(slot.id)

        return slots.filter(id__in=available_slots).order_by('start_time')



class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


from adminsite.models import Coupon
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def booking_summary(request):
    service_id = request.data.get('service_id')
    address_id = request.data.get('address_id')
    barber_id = request.data.get('barber_id')
    slot_id = request.data.get('slot_id')
    coupon_code = request.data.get('coupon_code')  # Optional

    try:
        service = ServiceModel.objects.get(id=service_id)
        address = Address.objects.get(id=address_id, user=request.user)

        summary = {
            'service': {
                'name': service.name,
                'price': float(service.price),
                'duration': service.duration_minutes,
            },
            'address': {
                'full_address': f"{address.building}, {address.street}, {address.city}, {address.state} - {address.pincode}",
                'mobile': address.mobile,
            }
        }

        if barber_id and slot_id:
            try:
                barber = User.objects.get(id=barber_id, user_type='barber')
                slot = BarberSlot.objects.get(id=slot_id, is_booked=False)

                summary['barber'] = {
                    'name': barber.name,
                    'phone': barber.phone,
                }
                summary['slot'] = {
                    'date': slot.date,
                    'start_time': slot.start_time,
                    'end_time': slot.end_time,
                }
            except User.DoesNotExist:
                return Response({"error": "Barber not found."}, status=404)
        else:
            print("Instant booking: Skipping barber and slot details")

        service_amount = float(service.price)
        platform_fee = round(0.05 * service_amount, 2)
        total_amount = service_amount + platform_fee

        discount = 0
        coupon_info = None

        if coupon_code:
            try:
        
                coupon = Coupon.objects.get(
                    code__iexact=coupon_code.strip(), 
                    is_active=True,
                    service=service
                )

                if not coupon.is_valid():
                    return Response({"error": "Coupon has expired."}, status=400)
                if not coupon.can_user_use_coupon(request.user):
                    return Response({"error": "You have reached the maximum usage limit for this coupon."}, status=400)

                total_before_discount = service_amount + platform_fee
                discount = float(coupon.get_discount_amount(Decimal(str(total_before_discount))))
                total_amount = total_before_discount - discount
                coupon_info = {
                    "code": coupon.code,
                    "discount_percentage": coupon.discount_percentage,
                    "discount_amount": discount,
                    "max_usage_per_customer": coupon.max_usage_per_customer,
                }

            except Coupon.DoesNotExist:
                return Response({"error": "Invalid or inapplicable coupon."}, status=400)

        summary.update({
            'service_amount': round(service_amount, 2),
            'platform_fee': platform_fee,
            'discount': discount,
            'total_amount': round(total_amount, 2),
            'coupon': coupon_info,
        })

        return Response(summary)

    except ServiceModel.DoesNotExist:
        return Response({"error": "Service not found."}, status=404)
    except Address.DoesNotExist:
        return Response({"error": "Address not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


class BookingCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingCreateSerializer

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        booking_type = request.data.get('booking_type') or request.session.get('booking_type')
        if not booking_type:
            return Response(
                {"detail": "Booking type is missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.save()

        logger.info(f"Booking created successfully: {booking.id}")

        return Response(
            {
                "detail": "Booking created successfully",
                "booking_id": booking.id,
                "success": True,
                "total_amount": float(booking.total_amount),
                "payment_method": request.data.get('payment_method')
            },
            status=status.HTTP_201_CREATED
        )


class BookingSuccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        booking = Booking.objects.filter(customer=request.user).order_by('-created_at').first()
        if not booking:
            return Response({"detail": "No bookings found"}, status=404)
        payment = getattr(booking, 'payment', None)
        data = {
            "orderid": booking.id,
            "name": booking.customer.name,
            "barbername": booking.barber.name,
            "slottime": f"{booking.slot.start_time} - {booking.slot.end_time}",
            "start_time": str(booking.slot.start_time),
            "end_time": str(booking.slot.end_time),
            "date": str(booking.slot.date),
            "service": booking.service.name,
            "total_amount": str(booking.total_amount),"payment_method": payment.payment_method if payment else "N/A",
            "booking_status": booking.status,
            "booking_type":booking.booking_type
        }
        return Response(data)
    
class BookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(customer=request.user).order_by('-created_at')
        data = []

        for b in bookings:
            booking_info = {
                "id": b.id,
                "service": b.service.name if b.service else "Unknown Service",
                "booking_status": b.status,
                "booking_type": b.booking_type,
                "total_amount": float(b.total_amount),
            }

            if b.booking_type == "SCHEDULE_BOOKING":
                booking_info.update({
                    "barbername": b.barber.name if b.barber else "N/A",
                    "slottime": f"{b.slot.start_time} - {b.slot.end_time}" if b.slot else "N/A",
                    "date": str(b.slot.date) if b.slot else "N/A",
                })
            else:
                booking_info.update({
                    "barbername": "No barber assigned",
                    "slottime": "N/A",
                    "date": str(b.created_at.date()),
                })

            data.append(booking_info)

        return Response(data)
    
class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, customer=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        payment = getattr(booking, 'payment', None)

        if booking.slot:
            slottime = f"{booking.slot.start_time} - {booking.slot.end_time}"
            start_time = str(booking.slot.start_time)
            end_time = str(booking.slot.end_time)
            date = str(booking.slot.date)
        else:
            slottime = "N/A"
            start_time = "N/A"
            end_time = "N/A"
            date = str(booking.created_at.date()) 
        data = {
            "orderid": booking.id,
            "name": booking.customer.name,
            "barbername": booking.barber.name if booking.barber else "Unassigned",
            "slottime": slottime,
            "start_time": start_time,
            "end_time": end_time,
            "date": date,
            "service": booking.service.name,
            "booking_type": booking.booking_type,
            "total_amount": str(booking.total_amount),
            "payment_method": payment.payment_method if payment else "N/A",
            "booking_status": booking.status,
        }
        return Response(data)



@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_travel_status(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, barber=request.user)
        new_status = request.data.get('travel_status')

        if new_status not in dict(Booking.TRAVEL_STATUS_CHOICES).keys():
            return Response({"error": "Invalid travel status."}, status=400)

        booking.travel_status = new_status
        booking.save()
        return Response({"message": "Travel status updated.", "travel_status": booking.travel_status})
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found or not assigned to you."}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_travel_status(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, customer=request.user)
        return Response({"travel_status": booking.travel_status})
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found."}, status=404)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_details(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, barber=request.user)
        booking_data = {
            'id': booking.id,
            'customer': {'name': booking.customer.name if booking.customer else ''},
            'service': {'name': booking.service.name if booking.service else ''},
            'total_amount': booking.total_amount,
            'travel_status': booking.travel_status,
        }
        return Response(booking_data)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found or not assigned to you."}, status=404)
    

class CustomerWalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, created = CustomerWallet.objects.get_or_create(user=request.user)
        data = {
            "id": wallet.id,
            "amount": wallet.amount,
            "account_total_balance": wallet.account_total_balance,
            "created_at": wallet.created_at
        }
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CustomerWalletSerializer(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            wallet, created = CustomerWallet.objects.get_or_create(user=request.user)
            wallet.account_total_balance += amount
            wallet.save()
            
            return Response({'message': 'Amount successfully added to your wallet'}, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmergencyCancel(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            with transaction.atomic():
                booking = get_object_or_404(Booking, id=booking_id, customer=request.user)

                if booking.status in ['CANCELLED', 'COMPLETED']:
                    return Response({'error': 'This booking has already been cancelled or completed'},
                                    status=status.HTTP_400_BAD_REQUEST)

                if booking.travel_status in ['ALMOST_NEAR', 'ARRIVED']:
                    return Response({'error': "You can't cancel this booking because the barber is almost at or has reached your location"},
                                    status=status.HTTP_400_BAD_REQUEST)

                fine_percentage = Decimal('0.10')
                fine_amount = booking.total_amount * fine_percentage

                # Check payment method from PaymentModel
                payment_method = booking.payment.payment_method if booking.payment else None

                if payment_method != 'COD':
                    # Refund scenario (non-COD)
                    refund_amount = booking.total_amount - fine_amount

                    wallet, _ = CustomerWallet.objects.get_or_create(user=request.user)
                    wallet.account_total_balance += refund_amount
                    wallet.save()

                    admin_wallet, _ = AdminWallet.objects.get_or_create(id=1, defaults={'total_earnings': Decimal('0.00')})
                    admin_wallet.total_earnings -= refund_amount  
                    admin_wallet.save()

                    AdminWalletTransaction.objects.create(
                        wallet=admin_wallet,
                        amount=-refund_amount,
                        note=f"Booking #{booking.id} - Refund issued to customer for emergency cancel"
                    )

                    CustomerWalletTransaction.objects.create(
                        wallet=wallet,
                        amount=refund_amount,
                        note=f"Refund of ₹{refund_amount} for cancelled Booking #{booking.id} (Emergency)"
                    )
                    CustomerWalletTransaction.objects.create(
                        wallet=wallet,
                        amount=-fine_amount,
                        note=f"Fine ₹{fine_amount} for cancelled Booking #{booking.id}"
                    )
                else:
                    
                    wallet, _ = CustomerWallet.objects.get_or_create(user=request.user)
                    CustomerWalletTransaction.objects.create(
                        wallet=wallet,
                        amount=-fine_amount,
                        note=f"Fine ₹{fine_amount} for cancelled Booking #{booking.id} (COD)"
                    )

                if booking.barber:
                    barber_wallet, _ = BarberWallet.objects.get_or_create(barber=booking.barber)
                    barber_wallet.balance += fine_amount
                    barber_wallet.save()

                    WalletTransaction.objects.create(
                        wallet=barber_wallet,
                        amount=fine_amount,
                        note=f"Fine received from emergency cancel of booking #{booking.id}"
                    )

                booking.status = 'CANCELLED'
                booking.save()

                return Response({
                    'message': 'Booking cancelled successfully!',
                    'fine_amount': str(fine_amount),
                    'refund_amount': str(refund_amount) if payment_method != 'COD' else '0.00',
                    'wallet_balance': str(wallet.account_total_balance)
                }, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



from .models import Rating


from rest_framework import generics, permissions, status
from rest_framework.response import Response

class RatingListCreateView(generics.ListCreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        booking_id = self.request.query_params.get('booking')
        barber_id = self.request.query_params.get('barber')
        
        queryset = Rating.objects.all()
        
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id, user=self.request.user)
        elif barber_id:
            queryset = queryset.filter(barber_id=barber_id)
        else:
            queryset = queryset.filter(user=self.request.user)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        booking = serializer.validated_data['booking']
        serializer.save(
            user=self.request.user,
            barber=booking.barber
        )

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
class CreateComplaintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id, customer=request.user)

        if hasattr(booking, 'complaint'):
            return Response({"detail": "Complaint already submitted for this booking."}, status=400)

        serializer = ComplaintSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, booking=booking)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


from.serializer import CustomerTransactionSerializer

class CustomerWalletTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = CustomerWallet.objects.filter(user=request.user).first()
        if not wallet:
            return Response({'history': []})

        transactions = CustomerWalletTransaction.objects.filter(wallet=wallet).order_by('-created_at')
        serializer = CustomerTransactionSerializer(transactions, many=True)
        return Response({'history': serializer.data})
    

class CustomerComplaintsListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        booking_id = request.query_params.get('booking')
        complaints = Complaints.objects.filter(user=request.user)

        if booking_id:
            complaints = complaints.filter(booking_id=booking_id)

        serializer = ComplaintSerializer(complaints.order_by('-updated_at'), many=True)
        return Response(serializer.data)



