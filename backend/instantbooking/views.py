from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from customersite.models import Booking
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from authservice.models import User
from django.utils import timezone
from datetime import timedelta
import logging
logger = logging.getLogger("django")

class MakingFindingBarberRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id, 
                status__in=["PENDING", "CONFIRMED"]
            )

            barbers = User.objects.filter(
                user_type='barber',
                is_online=True,
                barber_services__service=booking.service
            ).distinct()

            if not barbers.exists():
                return Response(
                    {"message": "No barbers available at the moment."},
                    status=status.HTTP_404_NOT_FOUND
                )

            channel_layer = get_channel_layer()

            for barber in barbers:
                group_name = f"barber_{barber.id}"
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "new_booking_request",
                        "booking_id": booking.id,
                        "service": booking.service.name,
                        "customer_name": booking.customer.name,
                        "customer_id": booking.customer.id,
                        "address": str(booking.address),
                        "total_amount": str(booking.total_amount)
                    }
                )
                logger.info(f"📢 Sending booking {booking.id} to group {group_name}")


            return Response(
                {"message": "Booking request sent to available barbers."},
                status=status.HTTP_200_OK
            )

        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found or invalid status."},
                status=status.HTTP_404_NOT_FOUND
            )  


class DoggleStatusView(APIView): 
    permission_classes = [IsAuthenticated]

    def get(self, request, barber_id):
        try:
            barber = User.objects.get(id=barber_id, user_type='barber')
            return Response({
                'is_online': barber.is_online
            }, status=200)
        except User.DoesNotExist:
            return Response({'message': 'Barber not found'}, status=404)

    def post(self, request, barber_id):
        action = request.data.get('action')
        barber = User.objects.get(id=barber_id, user_type='barber')
  
        now = timezone.now()
        next_15_minutes = now + timedelta(minutes=15)

        upcoming_booking = Booking.objects.filter(
            barber=barber,
            booking_type="SCHEDULE_BOOKING",
            service_started_at__gte=now,                    
            service_started_at__lte=next_15_minutes,        
            status__in=["PENDING", "CONFIRMED"]
        ).first()

        if action == 'online':
            if upcoming_booking:
                return Response({
                    'message': 'You have a scheduled booking in the next 15 minutes. Cannot go online.'
                }, status=400)
            
            barber.is_online = True
            barber.save()
            return Response({'message': 'Barber is now online.'}, status=200)

        elif action == 'offline':
            barber.is_online = False
            barber.save()
            return Response({'message': 'Barber is now offline.'}, status=200)

        else:
            return Response({'message': 'Invalid action provided.'}, status=400)





