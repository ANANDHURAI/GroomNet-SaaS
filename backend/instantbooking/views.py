from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from authservice.models import User
from adminsite.models import ServiceModel


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from authservice.models import User
from adminsite.models import ServiceModel
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from authservice.models import User
from adminsite.models import ServiceModel
import logging

logger = logging.getLogger(__name__)

class FindNearbyBarbers(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer = request.user
        service_id = request.data.get("service_id")

        if not service_id:
            return Response({"error": "Service ID is required"}, status=400)

        # Validate customer type
        if customer.user_type != "customer":
            return Response({"error": "Only customers can request bookings"}, status=403)

        try:
            service = ServiceModel.objects.get(id=service_id)
        except ServiceModel.DoesNotExist:
            return Response({"error": "Service not found"}, status=404)

        # Find online barbers for this service
        barbers = User.objects.filter(
            user_type="barber",
            is_online=True,
            is_active=True,
            is_blocked=False,
            barber_services__service_id=service_id,
            barber_services__is_active=True
        ).distinct().order_by('id')

        logger.info(f"Found {barbers.count()} online barbers for service {service_id}")

        if not barbers.exists():
            return Response({
                "error": "No online barbers available for this service",
                "barbers_found": 0
            }, status=404)
        
        first_barber = barbers.first()
        success = self.send_request_to_barber(first_barber, customer, service)
        
        if success:
            return Response({
                "message": "Booking request sent to barber. Please wait for response.",
                "barbers_found": barbers.count(),
                "barber_contacted": first_barber.name
            })
        else:
            return Response({
                "error": "Failed to send booking request",
                "barbers_found": barbers.count()
            }, status=500)

    def send_request_to_barber(self, barber, customer, service):
        """Send booking request to barber via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            
            # Send booking request to barber
            async_to_sync(channel_layer.group_send)(
                f"barber_{barber.id}",
                {
                    "type": "send_booking_request",
                    "customer_id": customer.id,
                    "customer_name": customer.name,
                    "customer_phone": customer.phone or "",
                    "customer_profile_image": customer.profileimage.url if customer.profileimage else "",
                    "service_id": service.id,
                    "service_name": service.name,
                    "service_price": str(service.price),
                }
            )
            
            logger.info(f"Booking request sent to barber {barber.id} for customer {customer.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending booking request to barber {barber.id}: {e}")
            return False


class BarberOnlineStatus(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != "barber":
            return Response({"error": "Only barbers can access this endpoint"}, status=403)
        
        return Response({
            "is_online": request.user.is_online,
            "barber_id": request.user.id,
            "barber_name": request.user.name
        })
    
    def post(self, request):
        if request.user.user_type != "barber":
            return Response({"error": "Only barbers can access this endpoint"}, status=403)
        
        is_online = request.data.get("is_online", False)
        
        try:
            updated = User.objects.filter(id=request.user.id).update(is_online=is_online)
            
            if updated:
                logger.info(f"Barber {request.user.id} status updated to {'online' if is_online else 'offline'}")
                return Response({
                    "message": "Status updated successfully",
                    "is_online": is_online,
                    "barber_id": request.user.id
                })
            else:
                return Response({"error": "Failed to update status"}, status=500)
        
        except Exception as e:
            logger.error(f"Error updating barber status: {e}")
            return Response({"error": "Failed to update status"}, status=500)
        


class CustomerBookingStatus(APIView):
    """API to check customer's booking status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != "customer":
            return Response({"error": "Only customers can access this endpoint"}, status=403)
        
        return Response({
            "customer_id": request.user.id,
            "customer_name": request.user.name,
            "message": "Ready to receive booking updates"
        })
        
        
# class BarberOnlineStatus(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         barber = request.user
#         if barber.user_type != "barber":
#             return Response({"error": "Only barbers can access this endpoint"}, status=403)
            
#         return Response({
#             "is_online": barber.is_online
#         })

#     def post(self, request):
#         barber = request.user
#         if barber.user_type != "barber":
#             return Response({"error": "Only barbers can access this endpoint"}, status=403)
            
#         is_online = request.data.get("is_online", False)
        
#         barber.is_online = is_online
#         barber.save()
        
#         return Response({
#             "message": f"Status updated to {'online' if is_online else 'offline'}",
#             "is_online": is_online
#         })


# class CustomerBookingStatus(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Get customer's current booking status"""
#         customer = request.user
#         if customer.user_type != "customer":
#             return Response({"error": "Only customers can access this endpoint"}, status=403)

#         latest_booking = Booking.objects.filter(
#             customer=customer,
#             booking_type="INSTANT_BOOKING",
#             status__in=["PENDING", "CONFIRMED"]
#         ).order_by('-created_at').first()

#         if not latest_booking:
#             return Response({"message": "No active bookings"})

#         data = {
#             "booking_id": latest_booking.id,
#             "status": latest_booking.status,
#             "service_name": latest_booking.service.name,
#             "total_amount": str(latest_booking.total_amount),
#             "created_at": latest_booking.created_at.isoformat()
#         }

#         if latest_booking.barber:
#             data["barber_name"] = latest_booking.barber.name
#             data["barber_phone"] = latest_booking.barber.phone or ""

#         return Response(data)


# class CancelBooking(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """Cancel a booking"""
#         customer = request.user
#         booking_id = request.data.get("booking_id")
        
#         if not booking_id:
#             return Response({"error": "Booking ID is required"}, status=400)
        
#         try:
#             booking = Booking.objects.get(
#                 id=booking_id,
#                 customer=customer,
#                 status="PENDING"
#             )
#             booking.status = "CANCELLED"
#             booking.save()
            
#             return Response({"message": "Booking cancelled successfully"})
#         except Booking.DoesNotExist:
#             return Response({"error": "Booking not found or already processed"}, status=404)
        