from .serializer import CustomerTransactionSerializer
from rest_framework import generics, permissions, status
from .models import Rating
from adminsite.models import Coupon
from django.utils.timezone import make_aware, is_naive, now
from datetime import timedelta, datetime
from barbersite.models import BarberWallet, WalletTransaction
from django.db import transaction
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, generics
from rest_framework import serializers
from .serializer import (
    HomeSerializer,
    CategorySerializer,
    ServiceSerializer,
    BarberSerializer,
    AvailableSlotSerializer,
    AddressSerializer,
    BookingCreateSerializer,
    CustomerWalletSerializer,
    LocationSerializer,
    RatingSerializer,
    ComplaintSerializer
)
from adminsite.models import CategoryModel, ServiceModel, AdminWallet, AdminWalletTransaction
import logging
from barbersite.models import BarberSlot, BarberService
from django.contrib.auth.models import User
from django.utils import timezone
from profileservice.models import Address, UserProfile
from profileservice.serializers import AddressSerializer
from authservice.models import User
from .models import Booking, CustomerWallet, Complaints, CustomerWalletTransaction
logger = logging.getLogger(__name__)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import PaymentModel
import pytz 
from django.conf import settings 



class Home(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = CategoryModel.objects.filter(is_blocked=False).order_by('-id')
        services = ServiceModel.objects.select_related('category').filter(
            is_blocked=False,
            category__is_blocked=False
        )

        data = {
            'greeting_message': f'Hello, welcome {request.user.name}!',
            'categories': categories,
            'services': services,
        }
        
      
        serializer = HomeSerializer(data, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)




class UserLocationUpdateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LocationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={'request': request})
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
        queryset = ServiceModel.objects.filter(
            is_blocked=False, category__is_blocked=False)
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
                is_blocked=False,
                is_verified=True 
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def booking_summary(request):
    service_id = request.data.get('service_id')
    address_id = request.data.get('address_id')
    barber_id = request.data.get('barber_id')
    slot_id = request.data.get('slot_id')
    coupon_code = request.data.get('coupon_code')

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
                    return Response({"error": "You have used this coupon."}, status=400)

                total_before_discount = service_amount + platform_fee
                discount = float(coupon.get_discount_amount(
                    Decimal(str(total_before_discount))))
                total_amount = total_before_discount - discount
                coupon_info = {
                    "code": coupon.code,
                    "discount_percentage": coupon.discount_percentage,
                    "discount_amount": discount,
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





class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = request.user

        with transaction.atomic():
            
            coupon = data.pop("coupon", None)
            
            booking = Booking.objects.create(
                customer=user,
                service=data["service"],
                address=data["address"],
                barber=data.get("barber"),
                slot=data.get("slot"),
                coupon=coupon, 
                booking_type=data["booking_type"],
                total_amount=data["total_amount"],
                status="PENDING",
                is_payment_done=False
            )

            discount = Decimal('0.00')
            if coupon:
                original_amount = data["service"].price + (data["service"].price * Decimal('0.05'))
                discount = coupon.get_discount_amount(original_amount)

            payment = PaymentModel.objects.create(
                booking=booking,
                payment_method=data["payment_method"],
                payment_status="PENDING",
                service_amount=data["service"].price,
                platform_fee=data["service"].price * Decimal('0.05'),
                discount=discount,
                final_amount=data["total_amount"],
            )

            if booking.booking_type == "SCHEDULE_BOOKING":
                booking.status = "CONFIRMED"
                booking.is_payment_done = True
                payment.payment_status = "SUCCESS"
                
                if booking.slot:
                
                    local_tz = pytz.timezone(settings.TIME_ZONE)
                    naive_datetime = datetime.combine(booking.slot.date, booking.slot.start_time)
                    local_datetime = local_tz.localize(naive_datetime)
                    booking.service_started_at = local_datetime

                    slot_instance = BarberSlot.objects.select_for_update().get(id=booking.slot.id)

                    if slot_instance.is_booked:
                        raise serializers.ValidationError({"slot": "This slot is already booked"})

                    slot_instance.is_booked = True
                    slot_instance.save(update_fields=["is_booked"])

                booking.save()
                payment.save()

        return Response({
            "booking_id": booking.id,
            "booking_type": booking.booking_type,
            "status": booking.status
        }, status=201)



      
            
    

class BookingSuccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        booking = Booking.objects.filter(
            customer=request.user).order_by('-created_at').first()
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
            "total_amount": str(booking.total_amount), "payment_method": payment.payment_method if payment else "N/A",
            "booking_status": booking.status,
            "booking_type": booking.booking_type
        }
        return Response(data)




class BookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(
            customer=request.user).order_by('-created_at')
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
              
                if b.status == "CONFIRMED" and b.barber:
                    barber_name = b.barber.name
                elif b.status == "CANCELLED":
                    barber_name = "No Barber Found"
                else:
                    barber_name = "Searching..." 

                booking_info.update({
                    "barbername": barber_name,
                    "slottime": "Instant",
                    "date": str(b.created_at.date()),
                })

            data.append(booking_info)

        return Response(data)




class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, customer=request.user)
            is_rated = getattr(booking, 'rating', None) is not None or Rating.objects.filter(booking=booking, user=request.user).exists()
            has_complaint = hasattr(booking, 'complaint')
            
            
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        payment = getattr(booking, 'payment', None)

        if booking.booking_type == "SCHEDULE_BOOKING" and booking.slot:
           
            slottime = f"{booking.slot.start_time.strftime('%I:%M %p')} - {booking.slot.end_time.strftime('%I:%M %p')}"
            date = str(booking.slot.date)
            start_time = str(booking.slot.start_time)
            end_time = str(booking.slot.end_time)
        else:

            created_time = booking.created_at.strftime("%I:%M %p")
            slottime = f"Booked at {created_time}"
            
            
            start_time = str(booking.service_started_at.time()) if booking.service_started_at else str(booking.created_at.time())
            end_time = "N/A" 
            date = str(booking.created_at.date())

        if booking.barber:
            barber_name = booking.barber.name
        elif booking.status == "CANCELLED":
            barber_name = "Booking Cancelled - No Barber"
        else:
            barber_name = "Searching for Barber..."

        data = {
            "orderid": booking.id,
            "name": booking.customer.name,
            "barbername": barber_name,
            "slottime": slottime,
            "start_time": start_time,
            "end_time": end_time,
            "date": date,
            "service": booking.service.name,
            "booking_type": booking.booking_type,
            "total_amount": str(booking.total_amount),
            "is_rated": is_rated,
            "has_complaint": has_complaint,
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

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"customer_{booking.customer.id}",
            {
                "type": "travel_update", 
                "booking_id": booking.id,
                "travel_status": new_status
            }
        )

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
        wallet, created = CustomerWallet.objects.get_or_create(
            user=request.user)
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
            wallet, created = CustomerWallet.objects.get_or_create(
                user=request.user)
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
                    return Response({'error': 'Booking already processed'}, status=400)

                if booking.travel_status in ['ALMOST_NEAR', 'ARRIVED']:
                    return Response({'error': "Cannot cancel: Barber is too close."}, status=400)

                fine_percentage = Decimal('0.10')
                fine_amount = booking.total_amount * fine_percentage
                payment = booking.payment
                payment_method = payment.payment_method if payment else None
                
                wallet, _ = CustomerWallet.objects.get_or_create(user=request.user)
                admin_wallet, _ = AdminWallet.objects.get_or_create(id=1, defaults={'total_earnings': Decimal('0.00')})

                refund_amount = Decimal('0.00')

                if payment_method != 'COD':
                    refund_amount = booking.total_amount - fine_amount
                    wallet.account_total_balance += refund_amount
                    wallet.save()

                    admin_wallet.total_earnings -= refund_amount
                    admin_wallet.save()

                    CustomerWalletTransaction.objects.create(
                        wallet=wallet, amount=refund_amount, 
                        note=f"Refund (Emergency Cancel) #{booking.id}"
                    )
                    CustomerWalletTransaction.objects.create(
                        wallet=wallet, amount=-fine_amount, 
                        note=f"Cancellation Fine #{booking.id}"
                    )
                else:
                   
                    CustomerWalletTransaction.objects.create(
                        wallet=wallet, amount=-fine_amount, 
                        note=f"Cancellation Fine (COD) #{booking.id}"
                    )

               
                if booking.barber:
                    barber_wallet, _ = BarberWallet.objects.get_or_create(barber=booking.barber)
                    barber_wallet.balance += fine_amount
                    barber_wallet.save()
                    WalletTransaction.objects.create(
                        wallet=barber_wallet, amount=fine_amount, 
                        note=f"Fine received: Cancelled Booking #{booking.id}"
                    )

                booking.status = 'CANCELLED'
                booking.save()
                
                if payment:
                    payment.payment_status = 'REFUNDED' if payment_method != 'COD' else 'CANCELLED'
                    payment.save()

                if booking.barber:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f"barber_{booking.barber.id}",
                        {
                            "type": "booking_cancelled",
                            "booking_id": booking.id,
                            "message": "Customer cancelled the booking."
                        }
                    )

                return Response({
                    'message': 'Booking cancelled successfully!',
                    'fine_amount': str(fine_amount),
                    'refund_amount': str(refund_amount),
                    'wallet_balance': str(wallet.account_total_balance)
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error: {str(e)}'}, status=500)
        


class RatingListCreateView(generics.ListCreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

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
      
        if Rating.objects.filter(booking=booking, user=self.request.user).exists():
            raise ValueError("You have already rated this booking.")

        serializer.save(
            user=self.request.user,
            barber=booking.barber
        )

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)




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
    
    
    
class CustomerWalletTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = CustomerWallet.objects.filter(user=request.user).first()
        if not wallet:
            return Response({'history': []})

        transactions = CustomerWalletTransaction.objects.filter(
            wallet=wallet).order_by('-created_at')
        serializer = CustomerTransactionSerializer(transactions, many=True)
        return Response({'history': serializer.data})



class CustomerComplaintsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        booking_id = request.query_params.get('booking')
        complaints = Complaints.objects.filter(user=request.user)

        if booking_id:
            complaints = complaints.filter(booking_id=booking_id)

        serializer = ComplaintSerializer(
            complaints.order_by('-updated_at'), many=True)
        return Response(serializer.data)
