import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from customersite.models import Booking, PaymentModel
from adminsite.models import AdminWallet, AdminWalletTransaction
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging
from rest_framework.permissions import IsAuthenticated
logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateStripeCheckoutSession(APIView):
    def post(self, request, *args, **kwargs):
        booking_id = request.data.get("booking_id")
        booking = Booking.objects.get(id=booking_id)
        payment = PaymentModel.objects.get(booking=booking)

        capture_method = 'manual' if booking.booking_type == 'INSTANT_BOOKING' else 'automatic'

        success_url = f"{settings.BASE_APP_URL}/booking-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.BASE_APP_URL}/payment-cancelled"

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'unit_amount': int(payment.final_amount * 100),
                        'product_data': {
                            'name': f"{booking.service.name} ({booking.booking_type.replace('_', ' ')})",
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                payment_intent_data={
                    'capture_method': capture_method, 
                    'metadata': {
                        'booking_id': str(booking.id),
                        'booking_type': booking.booking_type
                    }
                },
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "booking_id": str(booking.id),
                    "booking_type": booking.booking_type
                }
            )
            
            return Response({
                "sessionId": session.id,
                "stripe_public_key": settings.STRIPE_PUBLISHABLE_KEY
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        
        

class VerifyPayment(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            booking_id = session.metadata.get("booking_id")
            
            if session.payment_status == 'paid' or session.payment_status == 'unpaid': 
               
                with transaction.atomic():
                    booking = Booking.objects.get(id=booking_id)
                    payment = PaymentModel.objects.get(booking=booking)
                    
                    payment.transaction_id = session.payment_intent
                    payment.payment_method = 'STRIPE'
                    
                    if booking.booking_type == 'SCHEDULE_BOOKING':
                        
                        booking.status = 'CONFIRMED'
                        booking.is_payment_done = True
                        payment.payment_status = 'SUCCESS'
                        self.add_to_admin_wallet(payment.total_amount, booking.id)
                    else:
                       
                        booking.status = 'PENDING'
                        booking.is_payment_done = False
                        payment.payment_status = 'PENDING' 
                    
                    booking.save()
                    payment.save()

                return Response({
                    "booking_id": booking.id,
                    "booking_type": booking.booking_type,
                    "status": "verified"
                })
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    
    def add_to_admin_wallet(self, amount, booking_id=None):
        try:
            admin_wallet, _ = AdminWallet.objects.get_or_create(
                id=1,
                defaults={'total_earnings': 0}
            )
            admin_wallet.total_earnings += amount
            admin_wallet.save()

            AdminWalletTransaction.objects.create(
                wallet=admin_wallet,
                amount=amount,
                note=f"Booking #{booking_id} - STRIPE payment received"
            )

        except Exception as e:
            logger.error(f"Error adding to admin wallet: {str(e)}")
            raise


class CreateWalletStripeCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            amount = request.data.get("amount")

            if not amount:
                return Response(
                    {"error": "Amount is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                amount_float = float(amount)
                unit_amount = int(amount_float * 100)
                if unit_amount <= 0:
                    raise ValueError("Amount must be positive")
            except ValueError:
                return Response(
                    {"error": "Invalid amount provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'unit_amount': unit_amount,
                        'product_data': {
                            'name': 'Wallet Top-Up',
                            'description': f"Add ₹{amount} to your wallet",
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{settings.BASE_APP_URL}/customer-wallet?success=true&amount={amount}&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.BASE_APP_URL}/customer-wallet?cancelled=true",
                metadata={
                    "customer_id": str(request.user.id),
                    "topup_amount": str(amount),
                }
            )

            return Response({
                "sessionId": checkout_session.id,
                "url": checkout_session.url,
                "amount": amount_float,
                "currency": "INR"
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return Response(
                {"error": f"Payment service error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPaymentAndAddToWallet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            session_id = request.data.get("session_id")

            if not session_id:
                return Response(
                    {"error": "Session ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            session = stripe.checkout.Session.retrieve(session_id)

            if session.payment_status == 'paid':
                amount = float(session.metadata.get('topup_amount', 0))
                user_id = int(session.metadata.get('customer_id', 0))

                if user_id != request.user.id:
                    return Response(
                        {"error": "Unauthorized"},
                        status=status.HTTP_403_FORBIDDEN
                    )

                from customersite.models import CustomerWallet, CustomerWalletTransaction
                from decimal import Decimal
                wallet, created = CustomerWallet.objects.get_or_create(
                    user=request.user)
                wallet.account_total_balance += Decimal(str(amount))
                wallet.save()

                CustomerWalletTransaction.objects.create(
                    wallet=wallet,
                    amount=Decimal(str(amount)),
                    note=f"₹{amount} added to your wallet"
                )

                return Response({
                    "success": True,
                    "message": f"Successfully added ₹{amount} to your wallet",
                    "amount": amount
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Payment not completed"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except stripe.error.StripeError as e:
            logger.error(f"Stripe verification error: {str(e)}")
            return Response(
                {"error": "Payment verification failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Verification error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
