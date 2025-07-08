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

)
from adminsite.models import CategoryModel , ServiceModel
import logging
from barbersite.models import BarberSlot, BarberService
from django.contrib.auth.models import User
from django.utils import timezone
from profileservice.models import Address,UserProfile
from profileservice.serializers import AddressSerializer
from authservice.models import User
from.models import Booking ,CustomerWallet
logger = logging.getLogger(__name__)
from django.utils import timezone
from datetime import datetime
import requests


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
    

class UserLocationUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            latitude = request.data.get('latitude')
            longitude = request.data.get('longitude')
            
            if not latitude or not longitude:
                return Response(
                    {'error': 'Latitude and longitude are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user_profile, created = UserProfile.objects.get_or_create(
                user=request.user,
                defaults={
                    'latitude': float(latitude),
                    'longitude': float(longitude)
                }
            )
            
            if not created:
                user_profile.latitude = float(latitude)
                user_profile.longitude = float(longitude)
                user_profile.save()

            address_data = self.reverse_geocode(latitude, longitude)
            
            user_type = request.user.user_type
            
            if user_type == "barber":
                return Response({
                    'message': 'Successfully updated barber location! You can now receive bookings.',
                    'user_type': user_type,
                    'latitude': latitude,
                    'longitude': longitude,
                    **address_data
                }, status=status.HTTP_200_OK)
            elif user_type == "customer":
                return Response({
                    'message': 'Successfully updated customer location! You can now start booking nearby services.',
                    'user_type': user_type,
                    'latitude': latitude,
                    'longitude': longitude,
                    **address_data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Location updated successfully',
                    'user_type': user_type,
                    'latitude': latitude,
                    'longitude': longitude,
                    **address_data
                }, status=status.HTTP_200_OK)
                
        except ValueError:
            return Response(
                {'error': 'Invalid latitude or longitude values'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def reverse_geocode(self, latitude, longitude):
        try:
            url = f"https://nominatim.openstreetmap.org/reverse"
            params = {
                'format': 'json',
                'lat': latitude,
                'lon': longitude,
                'zoom': 18,
                'addressdetails': 1
            }
            
            headers = {
                'User-Agent': 'GroomNet/1.0 (anandhurai@gmail.com)'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                address = data.get('address', {})
                
                building = address.get('house_number', '') + ' ' + address.get('road', '')
                street = address.get('suburb', '') or address.get('neighbourhood', '') or address.get('residential', '')
                city = address.get('city', '') or address.get('town', '') or address.get('village', '')
                district = address.get('state_district', '') or address.get('county', '')
                state = address.get('state', '')
                pincode = address.get('postcode', '')
                
                return {
                    'building': building.strip() or 'Current Location',
                    'street': street or 'Current Street',
                    'city': city or 'Current City',
                    'district': district or 'Current District',
                    'state': state or 'Current State',
                    'pincode': pincode or '000000'
                }
            else:
                return self.get_default_address()
                
        except requests.RequestException as e:
            print(f"Geocoding error: {e}")
            return self.get_default_address()
        except Exception as e:
            print(f"Unexpected error in reverse geocoding: {e}")
            return self.get_default_address()
    
    def get_default_address(self):
        return {
            'building': 'Current Location',
            'street': 'Current Street',
            'city': 'Current City',
            'district': 'Current District',
            'state': 'Current State',
            'pincode': '000000'
        }
    

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


class AvailableSlotListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailableSlotSerializer

    def get_queryset(self):
        barber_id = self.request.query_params.get('barber_id')
        date_str = self.request.query_params.get('date')
        
        if not barber_id or not date_str:
            return BarberSlot.objects.none()

        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        today = datetime.now().date()  
        current_time = datetime.now().time()

        queryset = BarberSlot.objects.filter(
            barber_id=barber_id,
            date=date_obj,
            is_booked=False
        )

        if date_obj == today:
            queryset = queryset.filter(start_time__gt=current_time)

        return queryset.order_by('start_time')


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
            print("📆 Schedule booking: Fetching barber and slot details")
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
                print("❌ Barber not found")
                return Response({"error": "Barber not found."}, status=404)
            except BarberSlot.DoesNotExist:
                print("❌ Slot not found or already booked")
                return Response({"error": "Slot not found or already booked."}, status=404)
        else:
            print("⚡ Instant booking: Skipping barber and slot details")

        service_amount = float(service.price)
        platform_fee = round(0.05 * service_amount, 2)
        total_amount = round(service_amount + platform_fee, 2)

        summary.update({
            'service_amount': service_amount,
            'platform_fee': platform_fee,
            'total_amount': total_amount,
        })

        print(f"✅ Returning booking summary: {summary}")
        return Response(summary)

    except ServiceModel.DoesNotExist:
        print("❌ Service not found")
        return Response({"error": "Service not found."}, status=404)
    except Address.DoesNotExist:
        print("❌ Address not found")
        return Response({"error": "Address not found."}, status=404)
    except Exception as e:
        print(f"❌ Unexpected error in booking_summary: {str(e)}")
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


    

        





