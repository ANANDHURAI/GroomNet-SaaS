# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from customersite.models import Booking
from .serializers import (
BarberActionSerializer,
)
import logging

logger = logging.getLogger("django")
User = get_user_model()
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from adminsite.models import AdminWallet
from barbersite.models import BarberWallet , WalletTransaction

class BookingMixin:
    """Mixin to handle common booking operations"""
    
    @staticmethod
    def has_active_instant_booking(barber):
        """Check if barber has any active instant booking"""
        return Booking.objects.filter(
            barber=barber,
            booking_type="INSTANT_BOOKING",
            status__in=["PENDING", "CONFIRMED"]
        ).exists()
    
    @staticmethod
    def has_conflicting_scheduled_booking(barber, start_time=None, end_time=None):
        """Check if barber has conflicting scheduled bookings"""
        now = timezone.now()
        
        if start_time is None:
            start_time = now
            end_time = now + timedelta(minutes=30)
        
        return Booking.objects.filter(
            barber=barber,
            booking_type="SCHEDULE_BOOKING",
            status__in=["PENDING", "CONFIRMED"],
            service_started_at__gte=start_time,
            service_started_at__lt=end_time
        ).exists()
    
    @staticmethod
    def get_available_barbers_for_booking(booking):
        """Get all available barbers for a specific booking"""
        potential_barbers = User.objects.filter(
            user_type='barber',
            is_online=True,
            barber_services__service=booking.service
        ).distinct()
        
        available_barbers = []
        
        for barber in potential_barbers:
            # Skip if barber has active instant booking
            if BookingMixin.has_active_instant_booking(barber):
                continue
            
            # Skip if barber has conflicting scheduled bookings
            if BookingMixin.has_conflicting_scheduled_booking(barber):
                continue
            
            available_barbers.append(barber)
        
        return available_barbers


class MakingFindingBarberRequest(APIView, BookingMixin):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                status="PENDING",
                booking_type="INSTANT_BOOKING"  
            )

            available_barbers = self.get_available_barbers_for_booking(booking)

            if not available_barbers:
                return Response(
                    {"message": "No barbers available at the moment."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Send booking request to all available barbers
            self._notify_barbers_new_booking(booking, available_barbers)

            return Response(
                {
                    "message": "Booking request sent to available barbers.",
                    "barbers_notified": len(available_barbers)
                },
                status=status.HTTP_200_OK
            )

        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found or invalid status."},
                status=status.HTTP_404_NOT_FOUND
            )

    def _notify_barbers_new_booking(self, booking, barbers):
        """Send booking notification to available barbers"""
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
            logger.info(f"Sent booking {booking.id} to barber {barber.id}")


class DoggleStatusView(APIView, BookingMixin):
    permission_classes = [IsAuthenticated]

    def get(self, request, barber_id):
        try:
            barber = User.objects.get(id=barber_id, user_type='barber')

            has_active_instant = self.has_active_instant_booking(barber)
            has_upcoming_scheduled = self.has_conflicting_scheduled_booking(barber)

            return Response({
                'is_online': barber.is_online,
                'has_active_instant_booking': has_active_instant,
                'has_upcoming_scheduled_booking': has_upcoming_scheduled
            }, status=200)
            
        except User.DoesNotExist:
            return Response({'message': 'Barber not found'}, status=404)

    def post(self, request, barber_id):
        action = request.data.get('action')
        
        try:
            barber = User.objects.get(id=barber_id, user_type='barber')
        except User.DoesNotExist:
            return Response({'message': 'Barber not found'}, status=404)

        if action == 'online':
            return self._handle_go_online(barber)
        elif action == 'offline':
            return self._handle_go_offline(barber)
        else:
            return Response({'message': 'Invalid action provided.'}, status=400)

    def _handle_go_online(self, barber):
        """Handle barber going online"""
        # Check for active instant bookings
        if self.has_active_instant_booking(barber):
            return Response({
                'message': 'You already have an active instant booking. Complete it before going online again.'
            }, status=400)

        # Check for upcoming scheduled bookings in next 30 minutes
        if self.has_conflicting_scheduled_booking(barber):
            return Response({
                'message': 'You have a scheduled booking in the next 30 minutes. Cannot go online for instant bookings.'
            }, status=400)

        barber.is_online = True
        barber.save()
        return Response({'message': 'Barber is now online.'}, status=200)

    def _handle_go_offline(self, barber):
        """Handle barber going offline"""
        if self.has_active_instant_booking(barber):
            return Response({
                'message': 'You cannot go offline while you have an active instant booking.'
            }, status=400)

        barber.is_online = False
        barber.save()
        return Response({'message': 'Barber is now offline.'}, status=200)


class ActiveBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, barber_id):
        try:
            barber = User.objects.get(id=barber_id, user_type='barber')
        except User.DoesNotExist:
            return Response({"error": "Barber not found."}, status=404)

        active_instant_booking = Booking.objects.filter(
            barber=barber,
            status__in=["PENDING", "CONFIRMED"],
            booking_type="INSTANT_BOOKING"
        ).order_by('-created_at').first()

       
        now = timezone.now()
        upcoming_scheduled = Booking.objects.filter(
            barber=barber,
            booking_type="SCHEDULE_BOOKING",
            status__in=["PENDING", "CONFIRMED"],
            service_started_at__gte=now,
            service_started_at__lt=now + timedelta(hours=2)
        ).order_by('service_started_at')[:3] 

        response_data = {
            "active_instant_booking": None,
            "upcoming_scheduled_bookings": []
        }

        if active_instant_booking:
            response_data["active_instant_booking"] = {
                "booking_id": active_instant_booking.id,
                "customer_name": active_instant_booking.customer.name,
                "customer_phone": active_instant_booking.customer.phone,
                "service_name": active_instant_booking.service.name,
                "duration": active_instant_booking.service.duration_minutes,
                "price": str(active_instant_booking.total_amount),
                "customer_location": {
                    "address": str(active_instant_booking.address)
                },
                "status": active_instant_booking.status
            }

        for booking in upcoming_scheduled:
            response_data["upcoming_scheduled_bookings"].append({
                "booking_id": booking.id,
                "customer_name": booking.customer.name,
                "service_name": booking.service.name,
                "scheduled_time": booking.service_started_at.isoformat(),
                "duration": booking.service.duration_minutes,
                "price": str(booking.total_amount)
            })

        return Response(response_data, status=200)


class HandleBarberActions(APIView, BookingMixin):
    permission_classes = [IsAuthenticated]

    def post(self, request, barber_id, booking_id):
        serializer = BarberActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']

        try:
            barber = User.objects.get(id=barber_id, user_type='barber')
        except User.DoesNotExist:
            return Response({'error': 'Barber not found.'}, status=404)

        if action == 'accept':
            return self._handle_accept_booking(barber, booking_id)
        elif action == 'reject':
            return self._handle_reject_booking(barber, booking_id)

    def _handle_accept_booking(self, barber, booking_id):
       
        if self.has_active_instant_booking(barber):
            return Response({
                'error': 'You already have an active instant booking.'
            }, status=400)

        if self.has_conflicting_scheduled_booking(barber):
            return Response({
                'error': 'You have a conflicting scheduled booking.'
            }, status=400)

        with transaction.atomic():
            try:
                booking = Booking.objects.select_for_update().get(
                    id=booking_id,
                    status='PENDING',
                    barber__isnull=True,
                    booking_type="INSTANT_BOOKING"
                )
            except Booking.DoesNotExist:
                return Response({
                    'error': 'Booking not found or already accepted by another barber.'
                }, status=404)

            if self.has_active_instant_booking(barber):
                return Response({
                    'error': 'You accepted another booking.'
                }, status=400)

        
            booking.barber = barber
            booking.status = 'CONFIRMED'
            booking.travel_status = 'NOT_STARTED'
            booking.save()

        self._notify_customer_booking_accepted(booking, barber)
        self._notify_other_barbers_remove_booking(booking, barber)

        return Response({
            'message': f'Booking accepted successfully.',
            'booking_id': booking.id,
            'status': 'success'
        }, status=200)

    def _handle_reject_booking(self, barber, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                status='PENDING',
                booking_type="INSTANT_BOOKING"
            )
        except Booking.DoesNotExist:
            return Response({
                'error': 'Booking not found or already processed.'
            }, status=404)


        available_barbers = [
            b for b in self.get_available_barbers_for_booking(booking)
            if b.id != barber.id
        ]

        if not available_barbers:
            self._notify_customer_no_barbers_available(booking)
        else:
            self._notify_barbers_new_booking(booking, available_barbers)

        return Response({
            'message': 'Booking rejected successfully.',
            'status': 'success'
        }, status=200)

    def _notify_customer_booking_accepted(self, booking, barber):
      
        channel_layer = get_channel_layer()
        
        profile_image_url = None
        if hasattr(barber, 'profileimage') and barber.profileimage:
            try:
                profile_image_url = barber.profileimage.url
            except ValueError:
                profile_image_url = None

        async_to_sync(channel_layer.group_send)(
            f"customer_{booking.customer.id}",
            {
                "type": "booking_accepted",
                "booking_id": booking.id,
                "message": f"{barber.name} accepted your booking.",
                "barber_details": {
                    "name": barber.name,
                    "phone": barber.phone,
                    "profile_image": profile_image_url,
                }
            }
        )

    def _notify_other_barbers_remove_booking(self, booking, accepting_barber):
      
        channel_layer = get_channel_layer()
        
        other_barbers = User.objects.filter(
            user_type='barber',
            is_online=True
        ).exclude(id=accepting_barber.id)

        for barber in other_barbers:
            async_to_sync(channel_layer.group_send)(
                f"barber_{barber.id}",
                {
                    "type": "remove_booking",
                    "booking_id": booking.id,
                    "message": "This booking was accepted by another barber."
                }
            )

    def _notify_customer_no_barbers_available(self, booking):
       
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f"customer_{booking.customer.id}",
            {
                "type": "no_barbers_available",
                "booking_id": booking.id,
                "message": "No barbers available to accept your booking right now. Please try again later."
            }
        )

    def _notify_barbers_new_booking(self, booking, barbers):
      
        channel_layer = get_channel_layer()
        
        for barber in barbers:
            async_to_sync(channel_layer.group_send)(
                f"barber_{barber.id}",
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



class CompletedServiceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related('customer', 'address', 'service', 'payment'),
            id=booking_id
        )
        payment = booking.payment

        data = {
            'id': booking.id,
            'customer_name': booking.customer.name,
            'customer_phone': booking.customer.phone,
            'address': f"{booking.address.building}, {booking.address.street}, "
                       f"{booking.address.city}, {booking.address.state} - {booking.address.pincode}",
            'service': booking.service.name,
            'price': str(booking.total_amount),
            'service_amount': str(payment.service_amount),
            'platform_fee': str(payment.platform_fee),
            'booking_type': booking.booking_type,
            'payment_method': payment.payment_method.upper(),
            'payment_done': payment.payment_status == "SUCCESS",
            'status': booking.status,
            'is_released_to_barber': payment.is_released_to_barber,
        }
        return Response(data)

    def post(self, request, booking_id):
        action = request.data.get('action')
        booking = get_object_or_404(Booking, id=booking_id)

        if action == 'service_completed':
            booking.status = "COMPLETED"
            booking.completed_at = now()
            booking.save()

            payment = booking.payment
            if payment.payment_method == "COD":
                payment_successful = True 
            else:
                payment_successful = payment.payment_status == "SUCCESS"
            
            not_released_to_barber = not payment.is_released_to_barber
            if payment_successful and not_released_to_barber:
                try:
                    with transaction.atomic():
                        admin_wallet = AdminWallet.objects.first()
                        if not admin_wallet:
                            return Response({"error": "Admin wallet not found"}, status=500)
                            
                        barber_wallet, _ = BarberWallet.objects.get_or_create(barber=booking.barber)
                        amount = payment.service_amount
                        if admin_wallet.total_earnings >= amount:
                            admin_wallet.total_earnings -= amount
                            admin_wallet.save()

                            barber_wallet.balance += amount
                            barber_wallet.save()

                            WalletTransaction.objects.create(
                                wallet=barber_wallet,
                                amount=amount,
                                note=f"Payment for Booking #{booking.id}"
                            )

                            payment.is_released_to_barber = True
                            payment.released_at = now()
                            if payment.payment_method == "COD":
                                payment.payment_status = "SUCCESS"
                            
                            payment.save()
                           
                            booking.is_payment_done = True
                            booking.save()

                        else:
                            return Response({
                                "error": f"Insufficient admin funds. Required: ₹{amount}, Available: ₹{admin_wallet.total_earnings}"
                            }, status=400)

                except Exception as e:
                    return Response({"error": f"Payment failed: {str(e)}"}, status=500)
        
 
            channel_layer = get_channel_layer()
            group_name = f"customer_{booking.customer.id}"

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "service_completed",
                    "booking_id": booking.id,
                    "message": "Thank you for choosing Groomnet. Your service has been completed.",
                }
            )
            return Response({"status": "Service completion and payment done"}, status=200)

        return Response({"error": "Invalid action"}, status=400)

