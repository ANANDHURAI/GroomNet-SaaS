from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from customersite.models import Booking
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class MakeingBookingRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        barber = request.user
        if barber.user_type != "barber":
            return Response(
                {"detail": "Only barbers can access booking details."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.select_related(
                'customer', 'service', 'address'
            ).get(id=booking_id)
            
            if booking.barber:
                return Response(
                    {"detail": "Booking already assigned to another barber."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking_data = {
                "booking_id": booking.id,
                "service_name": booking.service.name,
                "price": float(booking.service.price),
                "duration": booking.service.duration_minutes,
                "customer_name": booking.customer.name,
                "customer_location": {
                    "latitude": booking.address.latitude,
                    "longitude": booking.address.longitude,
                    "address": f"{booking.address.building}, {booking.address.street}, {booking.address.city}"
                },
                "created_at": booking.created_at,
                "status": booking.status
            }
            
            return Response(booking_data, status=status.HTTP_200_OK)
            
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BookingAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        barber = request.user
        
        if barber.user_type != "barber":
            return Response(
                {"detail": "Only barbers can accept bookings."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            with transaction.atomic():
                booking = Booking.objects.select_for_update().get(id=booking_id)
                
                if booking.barber:
                    return Response(
                        {"detail": "Booking already assigned to another barber."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if booking.status != 'PENDING':
                    return Response(
                        {"detail": "Booking is no longer available."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                booking.barber = barber
                booking.status = 'CONFIRMED'
                booking.save()
                
                channel_layer = get_channel_layer()
                
                async_to_sync(channel_layer.group_send)(
                    f"customer_booking_{booking_id}",
                    {
                        "type": "send_barber_assigned",
                        "data": {
                            "message": "Barber assigned",
                            "barber_name": barber.name,
                            "barber_phone": barber.phone,
                            "barber_profile": barber.profileimage.url if barber.profileimage else None,
                            "booking_confirmed": True
                        }
                    }
                )
                
                response_data = {
                    "message": "Booking accepted successfully.",
                    "booking_id": booking.id,
                    "customer_name": booking.customer.name,
                    "customer_phone": booking.customer.phone,
                    "customer_location": {
                        "latitude": booking.address.latitude,
                        "longitude": booking.address.longitude,
                        "address": f"{booking.address.building}, {booking.address.street}, {booking.address.city}"
                    },
                    "service_name": booking.service.name,
                    "service_price": float(booking.service.price),
                    "service_duration": booking.service.duration_minutes
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
                
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BookingRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        barber = request.user
        
        if barber.user_type != "barber":
            return Response(
                {"detail": "Only barbers can reject bookings."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.get(id=booking_id)
            
            print(f"Barber {barber.id} ({barber.name}) rejected booking {booking_id}")
            
            return Response(
                {"message": "Booking rejected successfully."}, 
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BookingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        customer = request.user
        
        if customer.user_type != "customer":
            return Response(
                {"detail": "Only customers can check booking status."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            booking = Booking.objects.select_related(
                'customer', 'barber', 'service'
            ).get(id=booking_id, customer=customer)
            
            response_data = {
                "booking_id": booking.id,
                "status": booking.status,
                "service_name": booking.service.name,
                "created_at": booking.created_at,
                "barber_assigned": booking.barber is not None
            }
            
            if booking.barber:
                response_data["barber_details"] = {
                    "name": booking.barber.name,
                    "phone": booking.barber.phone,
                    "profile_image": booking.barber.profileimage.url if booking.barber.profileimage else None
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BarberOnlineStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        barber = request.user
        if barber.user_type != 'barber':
            return Response(
                {'detail': 'Only barbers can check status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'is_online': getattr(barber, 'is_online', False)
        })

    def post(self, request):
        barber = request.user
        if barber.user_type != 'barber':
            return Response(
                {'detail': 'Only barbers can update status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        is_online = request.data.get('is_online', False)
        barber.is_online = is_online
        barber.save()
        
        return Response({'is_online': is_online})
    

class CustomerConformationView(APIView):
    permission_classes = [IsAuthenticated]
    channel_layer = get_channel_layer()

    def post(self, request, booking_id):
        action = request.data.get('action')

        if action == 'request_service':
            async_to_sync(self.channel_layer.group_send)(
                "service_start_request",
                {
                    "type": "send_request_to_customer",
                    "booking_id": booking_id
                }
            )
            return Response({"status": "Request sent to customer"}, status=200)

        elif action in ['ready', 'wait']:
            async_to_sync(self.channel_layer.group_send)(
                "service_start_request",
                {
                    "type": "customer_ready" if action == 'ready' else "customer_wait",
                    "booking_id": booking_id
                }
            )
            return Response({"status": f"Customer response: {action}"}, status=200)
        
        else:
            return Response({"error": "Invalid action"}, status=400)
    
