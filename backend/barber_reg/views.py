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


class BarberPersonalDetailsView(APIView):
    def generate_otp(self):
        return ''.join(random.choices(string.digits, k=6))

    def send_otp_email(self, email, name, otp):
        subject = 'Barber Registration - Email Verification'
        message = f"""
        Hi {name},

        Thank you for registering as a barber with us!
        Your OTP for email verification is: {otp}
        This OTP is valid for 10 minutes
        """
        try:
            mail = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=email,
                subject=subject,
                plain_text_content=message
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            sg.send(mail)
        except Exception as e:
            print(f"Failed to send OTP email via SendGrid: {str(e)}")

    def post(self, request):
        serializer = BarberPersonalDetailsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:

            user = User.objects.create_user(
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                phone=serializer.validated_data['phone'],
                gender=serializer.validated_data['gender'],
                password=serializer.validated_data['password'],
                user_type='barber',
                is_active=False
            )

            barber_request = BarberRequest.objects.create(
                user=user,
                registration_step='personal_details',
                status='pending'
            )

            otp = self.generate_otp()
            OTPVerification.objects.filter(user=user).delete()
            OTPVerification.objects.create(user=user, otp=otp)
            self.send_otp_email(user.email, user.name, otp)

            return Response({
                "message": "Personal details submitted successfully. Please check your email for OTP verification.",
                "user_id": user.id,
                "email": user.email,
                "next_step": "otp_verification"
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "error": "Failed to create barber account",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OTPVerificationView(APIView):
    def post(self, request):
        logger.info(f"OTP verification request data: {request.data}")
        logger.info(f"Request content type: {request.content_type}")

        email = request.data.get('email')
        otp = request.data.get('otp')

        logger.info(f"Extracted - Email: {email}, OTP: {otp}")

        if not email or not otp:
            logger.warning(f"Missing data - Email: {email}, OTP: {otp}")
            return Response({
                'error': 'Email and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, user_type='barber')
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            otp_record = OTPVerification.objects.get(user=user, otp=otp)
        except OTPVerification.DoesNotExist:
            return Response({
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.created_at < timezone.now() - timedelta(minutes=10):
            otp_record.delete()
            return Response({
                'error': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()

        barber_request = user.barber_request
        barber_request.registration_step = 'otp_verified'
        barber_request.save()

        otp_record.delete()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "Email verified successfully! You can now upload your documents.",
            "user_id": user.id,
            "user_type": user.user_type,
            "access": access_token,
            "refresh": str(refresh),
            "next_step": "upload_documents",
            "user_data": {
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "gender": user.gender
            }
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, user_type='barber')
        except User.DoesNotExist:
            return Response({
                'error': 'User not found or already verified'
            }, status=status.HTTP_404_NOT_FOUND)

        last_otp = OTPVerification.objects.filter(
            user=user).order_by('-created_at').first()
        if last_otp and last_otp.created_at > timezone.now() - timedelta(minutes=1):
            return Response({
                'error': 'Please wait at least 1 minute before requesting a new OTP'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp = self._generate_otp()

        OTPVerification.objects.filter(user=user).delete()

        OTPVerification.objects.create(user=user, otp=otp)

        self._send_otp_email(user.email, user.name, otp)

        return Response({
            "message": "New OTP sent to your email address.",
        }, status=status.HTTP_200_OK)

    def _generate_otp(self):
        return ''.join(random.choices(string.digits, k=6))

    def _send_otp_email(self, email, name, otp):
        subject = 'Barber Registration - New Email Verification Code'
        message = f"""
        Hi {name},

        Your new OTP for email verification is: {otp}
        This OTP is valid for 10 minutes.
        """
        try:
            mail = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails=email,
                subject=subject,
                plain_text_content=message
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            sg.send(mail)
        except Exception as e:
            print(f"Failed to send OTP email via SendGrid: {str(e)}")





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
