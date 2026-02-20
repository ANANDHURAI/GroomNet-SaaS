import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    BarberPersonalDetailsSerializer,
    DocumentUploadSerializer,
    BarberRegistrationStatusSerializer
)
from .models import BarberRequest, OTPVerification

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings

User = get_user_model()
logger = logging.getLogger(__name__)
from utils import generate_otp, store_otp ,verify_otp ,clear_otp , can_resend_otp




class BarberPersonalDetailsView(APIView):

    def send_otp_email(self, email, name, otp):
        subject = 'Barber Registration - Email Verification'
        message = f"""
            Hi {name},

            Your OTP for verification is: {otp}
            Valid for 10 minutes.
            """
        mail = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=email,
            subject=subject,
            plain_text_content=message
        )
        SendGridAPIClient(settings.SENDGRID_API_KEY).send(mail)

    def post(self, request):
        serializer = BarberPersonalDetailsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            name=serializer.validated_data['name'],
            email=serializer.validated_data['email'],
            phone=serializer.validated_data['phone'],
            gender=serializer.validated_data['gender'],
            password=serializer.validated_data['password'],
            user_type='barber',
            is_active=False
        )

        BarberRequest.objects.create(user=user)

        otp = generate_otp()
        store_otp(user.email, otp)

        self.send_otp_email(user.email, user.name, otp)

        return Response({
            "message": "OTP sent to email",
            "next_step": "otp_verification"
        }, status=201)






class OTPVerificationView(APIView):

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not verify_otp(email, otp):
            return Response({"error": "Invalid or expired OTP"}, status=400)

        user = User.objects.get(email=email, user_type='barber')
        user.is_active = True
        user.save()

        barber_request = user.barber_request
        barber_request.registration_step = 'otp_verified'
        barber_request.save()

        clear_otp(email)

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Email verified",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "next_step": "upload_documents"
        })
        
        



class ResendOTPView(APIView):


    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email, user_type="barber")
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_active:
            return Response(
                {"error": "User already verified"},
                status=status.HTTP_400_BAD_REQUEST
            )


        if not can_resend_otp(email):
            return Response(
                {"error": "Please wait before requesting another OTP"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        otp = generate_otp()
        store_otp(email, otp)

        self.send_otp_email(user.email, user.name, otp)

        return Response(
            {"message": "A new OTP has been sent to your email."},
            status=status.HTTP_200_OK
        )

    def send_otp_email(self, email, name, otp):
        subject = "Barber Registration - New Verification Code"
        message = f"""
            Hi {name},

            Your new OTP is: {otp}

            This code will expire in 5 minutes.

            If you didn't request this, please ignore.
            """

        try:
            mail = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=email,
                subject=subject,
                plain_text_content=message,
            )
            SendGridAPIClient(settings.SENDGRID_API_KEY).send(mail)

        except Exception as e:
            print(f"Email sending failed: {e}")




class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.user_type != 'barber':
            return Response({
                'error': 'Only barbers can upload documents'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            barber_request = user.barber_request
        except BarberRequest.DoesNotExist:
            return Response({
                'error': 'No barber registration found. Please complete personal details first.'
            }, status=status.HTTP_404_NOT_FOUND)

        if barber_request.is_documents_complete and barber_request.status != 'rejected':
            return Response({
                'error': 'Documents already uploaded'
            }, status=status.HTTP_400_BAD_REQUEST)

        if barber_request.status == 'rejected':
            barber_request.status = 'pending'
            barber_request.admin_comment = ''
            barber_request.save()

        serializer = DocumentUploadSerializer(
            barber_request, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            barber_request.mark_documents_uploaded()

            if 'profile_image' in serializer.validated_data:
                user.profileimage = serializer.validated_data['profile_image']
                user.save()

            return Response({
                'message': 'Documents uploaded successfully. Your application is now under review.',
                'registration_step': barber_request.registration_step,
                'status': barber_request.status
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BarberRegistrationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            logger.info(
                f"Fetching registration status for user: {user.id} - {user.email}")

            if not hasattr(user, 'barber_request'):
                logger.info(f"No barber request found for user: {user.id}")
                return Response({
                    'message': 'No registration found. Please start with personal details.',
                    'next_step': 'personal_details',
                    'can_continue': True,
                    'user_data': None
                }, status=status.HTTP_404_NOT_FOUND)

            barber_request = user.barber_request
            serializer = BarberRegistrationStatusSerializer(user)

            response_data = {
                'user_data': serializer.data,
                'next_step': self._get_next_step(barber_request),
                'can_continue': self._can_continue_registration(barber_request)
            }

            logger.info(f"Successfully retrieved status for user: {user.id}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(
                f"Error fetching registration status for user {request.user.id}: {str(e)}")
            return Response({
                'message': 'An error occurred while fetching registration status.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_next_step(self, barber_request):
        if barber_request.registration_step == 'personal_details':
            return 'otp_verification'
        elif barber_request.registration_step == 'otp_verified':
            return 'upload_documents'
        elif barber_request.registration_step == 'documents_uploaded':
            return 'wait_for_approval'
        elif barber_request.status == 'approved':
            return 'registration_complete'
        elif barber_request.status == 'rejected':
            return 'registration_rejected'
        return 'unknown'

    def _can_continue_registration(self, barber_request):
        return barber_request.status != 'approved'
