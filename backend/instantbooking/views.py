from barbersite.models import BarberWallet, WalletTransaction
from adminsite.models import AdminWallet, AdminWalletTransaction
from django.shortcuts import get_object_or_404
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
from customersite.models import Booking, CustomerWallet, CustomerWalletTransaction,PaymentModel
from .serializers import (
    BarberActionSerializer,
)

from django.conf import settings
import logging
logger = logging.getLogger("django")
User = get_user_model()
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY
from barbersite.models import Portfolio , BarberService



User = get_user_model()

class BookingMixin:
  
    SAFETY_BUFFER_MINUTES = 90 

    @staticmethod
    def has_active_instant_booking(barber):
        return Booking.objects.filter(
            barber=barber,
            booking_type="INSTANT_BOOKING",
            status__in=["PENDING", "CONFIRMED", "STARTED", "ARRIVED", "ON_THE_WAY"]
        ).exists()



    @staticmethod
    def get_next_scheduled_booking(barber):
        
        now = timezone.now()
        window_end = now + timedelta(hours=24)
        
        return Booking.objects.filter(
            barber=barber,
            booking_type="SCHEDULE_BOOKING",
            status="CONFIRMED",
            service_started_at__gte=now,
            service_started_at__lte=window_end
        ).order_by('service_started_at').first()



    @staticmethod
    def is_barber_schedule_conflict(barber, instant_booking_request=None):
        next_scheduled = BookingMixin.get_next_scheduled_booking(barber)
        
        if not next_scheduled:
            return False 

        now = timezone.now()
        time_until_next_job = (next_scheduled.service_started_at - now).total_seconds() / 60
       
        if time_until_next_job < BookingMixin.SAFETY_BUFFER_MINUTES:
            return True 

        return False




    @staticmethod
    def has_conflicting_scheduled_booking(barber):
        return BookingMixin.is_barber_schedule_conflict(barber)



    @staticmethod
    def get_available_barbers_for_booking(booking):
        potential_barbers = User.objects.filter(
            user_type='barber',
            is_online=True,
            barber_services__service=booking.service,
            barber_services__is_active=True 
        ).distinct()

        available_barbers = []
        for barber in potential_barbers:
            if BookingMixin.has_active_instant_booking(barber):
                continue
            
            if BookingMixin.is_barber_schedule_conflict(barber, booking):
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
                booking_type="INSTANT_BOOKING",
                barber__isnull=True
            )

            available_barbers = self.get_available_barbers_for_booking(booking)
            
            if not available_barbers:
                self._notify_customer_no_barbers_available(booking)
                return Response(
                    {"message": "No barbers available at the moment."},
                    status=status.HTTP_404_NOT_FOUND
                )

            self._notify_barbers_new_booking(request, booking, available_barbers)

            return Response({
                "message": "Booking request sent.",
                "barbers_notified": len(available_barbers)
            }, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or invalid status."}, status=404)



    def _notify_customer_no_barbers_available(self, booking):
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"customer_{booking.customer.id}",
            {
                "type": "no_barbers_available",
                "booking_id": booking.id,
                "message": "All nearby barbers are currently busy with upcoming schedules."
            }
        )




    def _notify_barbers_new_booking(self, request, booking, barbers):
        
        channel_layer = get_channel_layer()
        
        image_url = None
        if hasattr(booking.customer, 'profileimage') and booking.customer.profileimage:
            image_url = request.build_absolute_uri(booking.customer.profileimage.url)

        for barber in barbers:
            group_name = f"barber_{barber.id}"
            try:
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "new_booking_request",
                        "booking_id": booking.id,
                        "service": booking.service.name,
                        "customer_name": booking.customer.name,
                        "customer_id": booking.customer.id, 
                        "address": str(booking.address),
                        "total_amount": str(booking.total_amount),
                        "barber_image": image_url,
                    }
                )
            except Exception as e:
                logger.error(f"Socket Error for barber {barber.id}: {str(e)}")





class DoggleStatusView(APIView, BookingMixin):
    permission_classes = [IsAuthenticated]

    def get(self, request, barber_id):
        try:
            barber = User.objects.get(id=barber_id, user_type='barber')
            
            
            has_conflict = self.is_barber_schedule_conflict(barber)
            next_booking_time = None
            
            if has_conflict:
                next_job = self.get_next_scheduled_booking(barber)
                if next_job:
                    next_booking_time = next_job.service_started_at

            return Response({
                'is_online': barber.is_online,
                'has_active_instant_booking': self.has_active_instant_booking(barber),
                'has_upcoming_scheduled_booking': has_conflict,
                'next_booking_time': next_booking_time 
            }, status=200)
        except User.DoesNotExist:
            return Response({'message': 'Barber not found'}, status=404)




    def post(self, request, barber_id):
        action = request.data.get('action')
        try:
            with transaction.atomic():
                barber = User.objects.select_for_update().get(id=barber_id, user_type='barber')
                
                if action == 'online':
                    return self._handle_go_online(barber)
                elif action == 'offline':
                    return self._handle_go_offline(barber)
                
                return Response({'message': 'Invalid Action'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'message': 'Barber not found'}, status=404)
        except Exception as e:
            return Response({'message': 'Internal Server Error', 'details': str(e)}, status=500)




    def _handle_go_online(self, barber):
        if self.has_active_instant_booking(barber):
            return Response({
                'message': 'Finish your current booking before going online.',
                'error_code': 'ACTIVE_BOOKING'
            }, status=status.HTTP_400_BAD_REQUEST)

        if self.is_barber_schedule_conflict(barber):
            return Response({
                'message': 'Upcoming scheduled booking soon (within 90 mins). Cannot go online.',
                'error_code': 'SCHEDULE_CONFLICT'
            }, status=status.HTTP_400_BAD_REQUEST)

        
        has_services = BarberService.objects.filter(barber=barber, is_active=True).exists()
        if not has_services:
            return Response({
                'message': 'You must add at least one service before going online.',
                'error_code': 'NO_SERVICES' 
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            portfolio = Portfolio.objects.get(user=barber)
            if not portfolio.current_location or not portfolio.expert_at:
                 return Response({
                    'message': 'Please complete your portfolio before going online.',
                    'error_code': 'INCOMPLETE_PORTFOLIO'
                }, status=status.HTTP_403_FORBIDDEN)
        except Portfolio.DoesNotExist:
            return Response({
                'message': 'Please create your portfolio before going online.',
                'error_code': 'NO_PORTFOLIO'
            }, status=status.HTTP_403_FORBIDDEN)

        barber.is_online = True
        barber.save()
        return Response({'message': 'You are now Online.', 'is_online': True}, status=200)




    def _handle_go_offline(self, barber):
        barber.is_online = False
        barber.save()
        return Response({'message': 'You are now Offline.', 'is_online': False}, status=200)
    




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
            
        now = timezone.now()
        
        upcoming_scheduled = Booking.objects.filter(
            barber=barber,
            booking_type="SCHEDULE_BOOKING",
            status__in=["PENDING", "CONFIRMED"],
            service_started_at__gte=now,
            service_started_at__lt=now + timedelta(hours=2)
        ).order_by('service_started_at')[:3]
        

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




class HandleBarberActions(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, barber_id, booking_id):
        serializer = BarberActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']

        barber = get_object_or_404(User, id=barber_id, user_type='barber')

        if action == 'accept':
            return self._handle_accept(barber, booking_id)
        elif action == 'reject':
            return self._handle_reject(barber, booking_id)

    
    
    
    def _handle_accept(self, barber, booking_id):
        with transaction.atomic():
            try:
                booking = Booking.objects.select_for_update().get(
                    id=booking_id,
                    status="PENDING",
                    booking_type="INSTANT_BOOKING",
                    barber__isnull=True
                )
            except Booking.DoesNotExist:
                return Response({'error': 'Booking expired or taken.'}, status=404)

            payment = booking.payment

            if payment.payment_method == 'STRIPE' and payment.transaction_id:
                try:
                    stripe.PaymentIntent.capture(payment.transaction_id)
                    payment.payment_status = "SUCCESS"
                except stripe.error.StripeError as e:
                    return Response({'error': f'Payment capture failed: {str(e)}'}, status=500)
           
            elif payment.payment_method == 'WALLET':
                try:
                    customer_wallet = CustomerWallet.objects.select_for_update().get(user=booking.customer)
                    if customer_wallet.account_total_balance < payment.final_amount:
                        return Response({'error': 'Customer has insufficient wallet balance.'}, status=400)
                   
                    customer_wallet.account_total_balance -= payment.final_amount
                    customer_wallet.save()
                   
                    CustomerWalletTransaction.objects.create(
                        wallet=customer_wallet,
                        amount=-payment.final_amount,
                        note=f"Paid for Instant Booking #{booking.id}"
                    )
                    
                   
                    admin_wallet, _ = AdminWallet.objects.get_or_create(id=1)
                    admin_wallet.total_earnings += payment.final_amount
                    admin_wallet.save()
                    
                    payment.payment_status = "SUCCESS"
                    
                except CustomerWallet.DoesNotExist:
                    return Response({'error': 'Customer wallet not found.'}, status=400)

          
            elif payment.payment_method == 'COD':
                payment.payment_status = "PENDING"

            booking.barber = barber
            booking.status = "CONFIRMED"
            booking.travel_status = "NOT_STARTED"
            booking.save()
            payment.save()

        
        self._notify_customer_success(booking, barber)
        self._notify_other_barbers_remove(booking, barber)

        return Response({"status": "success", "booking_id": booking.id})
    
    
    
    def _handle_reject(self, barber, booking_id):
        return Response({"status": "success", "message": "Booking rejected locally."})



    def _notify_customer_success(self, booking, barber):
        channel_layer = get_channel_layer()
        profile_image_url = None
        if hasattr(barber, 'profileimage') and barber.profileimage:
             profile_image_url = self.request.build_absolute_uri(barber.profileimage.url)

        async_to_sync(channel_layer.group_send)(
            f"customer_{booking.customer.id}",
            {
                "type": "booking_accepted",
                "booking_id": booking.id,
                "barber_details": {
                    "name": barber.name,
                    "phone": barber.phone,
                    "profile_image": profile_image_url
                }
            }
        )



    def _notify_other_barbers_remove(self, booking, accepting_barber):
       
        channel_layer = get_channel_layer()
        potential_barbers = User.objects.filter(user_type='barber', is_online=True).exclude(id=accepting_barber.id)
        
        for b in potential_barbers:
             async_to_sync(channel_layer.group_send)(
                f"barber_{b.id}",
                {"type": "remove_booking", "booking_id": booking.id, "message": "Booking taken."}
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




class ExpireInstantBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
           
            booking = Booking.objects.get(
                id=booking_id,
                booking_type="INSTANT_BOOKING",
                status="PENDING",
                barber__isnull=True
            )
        except Booking.DoesNotExist:
            return Response({"message": "Booking already processed or invalid"}, status=400)

        with transaction.atomic():
            payment = booking.payment
            refund_processed = False

         
            if payment.payment_method == 'STRIPE':
                try:
                    if payment.transaction_id:
                        stripe.PaymentIntent.cancel(payment.transaction_id)
                        logger.info(f"Stripe Payment cancelled for booking {booking_id}")
                        refund_processed = True
                except stripe.error.StripeError as e:
                    logger.error(f"Stripe refund error: {str(e)}")

            elif payment.payment_method == 'WALLET':
                try:
                  
                    wallet = CustomerWallet.objects.get(user=booking.customer)
                   
                    refund_amount = payment.final_amount
                    wallet.account_total_balance += refund_amount
                    wallet.save()

                    CustomerWalletTransaction.objects.create(
                        wallet=wallet,
                        amount=refund_amount,
                        note=f"Refund for Booking #{booking.id} (No Barber Found)"
                    )
                    
                    refund_processed = True
                    logger.info(f"Wallet Refund of ₹{refund_amount} processed for user {booking.customer.id}")
                    
                except CustomerWallet.DoesNotExist:
                    logger.error(f"Wallet not found for user {booking.customer.id}")
                except Exception as e:
                    logger.error(f"Wallet refund error: {str(e)}")

            elif payment.payment_method == 'COD':
                refund_processed = True

            booking.status = "CANCELLED"
            booking.save()
            
            if refund_processed:
                payment.payment_status = "REFUNDED" if payment.payment_method != 'COD' else 'FAILED'
            else:
                payment.payment_status = "FAILED"
            
            payment.save()
           
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"customer_{booking.customer.id}",
                {
                    "type": "booking_cancelled",
                    "booking_id": booking.id,
                    "message": "No barbers available. Payment refunded to your wallet/card."
                }
            )

        return Response({"status": "expired", "refund_processed": refund_processed}, status=200)




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
            'address': str(booking.address),
            'service': booking.service.name,
            'price': str(booking.total_amount),
            'service_amount': str(payment.service_amount),
            'platform_fee': str(payment.platform_fee),
            'booking_type': booking.booking_type,
            'payment_method': payment.payment_method.upper(),
            'payment_done': payment.payment_status == "SUCCESS",
            'status': booking.status,
            'is_released_to_barber': payment.is_released_to_barber,
            'service_started_at': booking.service_started_at,
        }
        return Response(data)



    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        action = request.data.get('action')
        channel_layer = get_channel_layer()
        
        
        if action == 'complete_service':
            with transaction.atomic():
             
                booking = Booking.objects.select_for_update().get(id=booking_id)
                payment = PaymentModel.objects.select_for_update().get(booking=booking)

                if booking.status == "COMPLETED" and payment.is_released_to_barber:
                     return Response({"message": "Service already completed and paid."}, status=200)

                booking.status = "COMPLETED"
                booking.completed_at = timezone.now()
                booking.save()

                if payment.payment_method == "COD":
                    payment.payment_status = "SUCCESS"
                payment.save()

                earnings_added = 0.0

                if not payment.is_released_to_barber and payment.payment_status == "SUCCESS":
                    admin_wallet, _ = AdminWallet.objects.select_for_update().get_or_create(id=1)
                    barber_wallet, _ = BarberWallet.objects.select_for_update().get_or_create(barber=booking.barber)
                    
                    final_amount = payment.final_amount
                    platform_fee = payment.platform_fee
                    barber_share = final_amount - platform_fee
                    
                    if payment.payment_method == "COD":
                       
                        barber_wallet.balance -= platform_fee
                        WalletTransaction.objects.create(
                            wallet=barber_wallet, 
                            amount=-platform_fee, 
                            note=f"Platform Fee for COD Booking #{booking.id}"
                        )
                        
                        admin_wallet.total_earnings += platform_fee
                        AdminWalletTransaction.objects.create(
                            wallet=admin_wallet, 
                            amount=platform_fee, 
                            note=f"Fee collected from Barber #{booking.barber.id}"
                        )
                        earnings_added = float(barber_share) 
                        
                    else:
                    
                        if admin_wallet.total_earnings >= barber_share:
                            admin_wallet.total_earnings -= barber_share
                            barber_wallet.balance += barber_share
                            
                            WalletTransaction.objects.create(
                                wallet=barber_wallet, 
                                amount=barber_share, 
                                note=f"Earnings for Booking #{booking.id}"
                            )
                            AdminWalletTransaction.objects.create(
                                wallet=admin_wallet, 
                                amount=-barber_share, 
                                note=f"Payout to Barber #{booking.barber.id}"
                            )
                            earnings_added = float(barber_share)
                        else:
                            logger.error(f"Insufficient Admin Funds to pay Barber {booking.barber.id}")

                    admin_wallet.save()
                    barber_wallet.save()
                   
                    payment.is_released_to_barber = True
                    payment.released_at = timezone.now()
                    payment.save()
                    
                    booking.is_payment_done = True
                    booking.save()

            if booking.barber:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"barber_{booking.barber.id}",
                    {"type": "booking_completed", "booking_id": booking.id}
                )

            return Response({
                "status": "Service marked as completed successfully",
                "message": "Service has been completed.",
                "earnings": earnings_added
            }, status=200)




        if action == 'request_start':
            async_to_sync(channel_layer.group_send)(
                f"customer_{booking.customer.id}",
                {"type": "service_request", "subtype": "start_request", "booking_id": booking.id}
            )
            return Response({"status": "Request sent"}, status=200)



        if action == 'respond_start':
            response = request.data.get('response') 
            async_to_sync(channel_layer.group_send)(
                f"barber_{booking.barber.id}",
                {"type": "service_response", "subtype": "start_response", "response": response}
            )
            return Response({"status": "Response sent"}, status=200)



        if action == 'force_start':
            if not booking.service_started_at:
                booking.service_started_at = timezone.now()
                booking.save()
            return Response({"status": "Service started"}, status=200)


        if action == 'request_complete':
            async_to_sync(channel_layer.group_send)(
                f"customer_{booking.customer.id}",
                {"type": "service_request", "subtype": "complete_request", "booking_id": booking.id}
            )
            return Response({"status": "Verification sent"}, status=200)


        if action == 'respond_complete':
            response = request.data.get('response') 
            async_to_sync(channel_layer.group_send)(
                f"barber_{booking.barber.id}",
                {"type": "service_response", "subtype": "complete_response", "response": response}
            )
            return Response({"status": "Response sent"}, status=200)
        
        
        
        if action == 'collect_cod':
            payment = booking.payment
            if payment.payment_method == 'COD':
                payment.payment_status = "SUCCESS"
                payment.save()
                return Response({"status": "Cash collected successfully"}, status=200)
            else:
                return Response({"error": "This is not a COD booking"}, status=400)


        return Response({"error": "Invalid action"}, status=400)
