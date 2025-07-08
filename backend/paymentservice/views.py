import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from customersite.models import Booking, PaymentModel
from adminsite.models import AdminWallet
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripeCheckoutSession(APIView):
    def post(self, request, *args, **kwargs):
        try:
            booking_id = request.data.get("booking_id")
            
            if not booking_id:
                logger.error("No booking_id provided")
                return Response(
                    {"error": "booking_id is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                booking = get_object_or_404(Booking, id=booking_id, customer=request.user)
                logger.info(f"Found booking {booking_id} for user {request.user.id}")
            except Exception as e:
                logger.error(f"Booking not found: {booking_id}, user: {request.user.id}, error: {str(e)}")
                return Response(
                    {"error": "Booking not found or access denied"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            try:
                payment = PaymentModel.objects.get(booking=booking)
                logger.info(f"Found payment record for booking {booking_id}")
            except PaymentModel.DoesNotExist:
                logger.error(f"PaymentModel not found for booking {booking_id}")
                return Response(
                    {"error": "Payment record not found for this booking"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            
            try:
                total_amount = payment.total_amount 
                unit_amount = int(total_amount * 100)
                logger.info(f"Calculated unit_amount: {unit_amount} paisa for booking {booking_id}")
                
                if unit_amount <= 0:
                    logger.error(f"Invalid unit_amount: {unit_amount}")
                    return Response(
                        {"error": "Invalid payment amount"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                logger.error(f"Error calculating amount: {str(e)}")
                return Response(
                    {"error": "Error calculating payment amount"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
           
            barber_name = "Barber"
            if hasattr(booking.barber, 'name') and booking.barber.name:
                barber_name = booking.barber.name
            elif hasattr(booking.barber, 'username') and booking.barber.username:
                barber_name = booking.barber.username
            
            try:
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'], 
                    line_items=[{
                        'price_data': {
                            'currency': 'inr',
                            'unit_amount': unit_amount,
                            'product_data': {
                                'name': booking.service.name,
                                'description': f"Booking with {barber_name} - Service: {booking.service.name}",
                            },
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f"http://localhost:5173/booking-success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url="http://localhost:5173/payment-cancelled",
                    metadata={
                        "booking_id": str(booking.id),
                        "customer_id": str(request.user.id),
                        "payment_id": str(payment.id),
                    }
                )
                
                logger.info(f"Created Stripe session {checkout_session.id} for booking {booking_id}")
                
                return Response({
                    "sessionId": checkout_session.id, 
                    "stripe_public_key": settings.STRIPE_PUBLISHABLE_KEY,
                    "url": checkout_session.url,
                    "amount": float(total_amount),
                    "currency": "INR"
                })
                
            except stripe.error.StripeError as e:
                logger.error(f"Stripe error: {str(e)}")
                return Response(
                    {"error": f"Payment service error: {str(e)}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Exception as e:
            logger.error(f"Unexpected error in CreateStripeCheckoutSession: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPayment(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({"error": "session_id is required"}, status=400)
        
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                booking_id = session.metadata.get("booking_id")

                with transaction.atomic():
                    booking = Booking.objects.get(id=booking_id)
                    booking.is_payment_done = True
                    booking.save()

                    payment = PaymentModel.objects.filter(booking=booking).first()
                    if payment:
                        payment.transaction_id = session.id
                        payment.payment_status = 'SUCCESS'
                        payment.payment_method = 'STRIPE'
                        payment.save()

                        self.add_to_admin_wallet(payment.total_amount)

                        logger.info(f"Payment verified and admin wallet updated for booking {booking_id}")

                return Response({"message": "Payment verified and booking updated."})
            else:
                return Response({"message": "Payment not completed yet."}, status=202)
        except Exception as e:
            logger.error(f"Error in payment verification: {str(e)}")
            return Response({"error": str(e)}, status=500)
    
    def add_to_admin_wallet(self, amount):
        try:
            admin_wallet, created = AdminWallet.objects.get_or_create(
                id=1,
                defaults={'total_earnings': 0}
            )
            admin_wallet.total_earnings += amount
            admin_wallet.save()
            
            logger.info(f"Added ₹{amount} to admin wallet. New total: ₹{admin_wallet.total_earnings}")
            
        except Exception as e:
            logger.error(f"Error adding to admin wallet: {str(e)}")
            raise