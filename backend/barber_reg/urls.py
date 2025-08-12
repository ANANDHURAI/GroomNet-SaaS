from django.urls import path
from .views import (
    BarberPersonalDetailsView,
    DocumentUploadView,
    BarberRegistrationStatusView,
    OTPVerificationView,
    ResendOTPView
)

urlpatterns = [
    path('personal-details/', BarberPersonalDetailsView.as_view(),
         name='barber-personal-details'),
    path('upload-documents/', DocumentUploadView.as_view(),
         name='barber-document-upload'),
    path('registration-status/', BarberRegistrationStatusView.as_view(),
         name='barber-registration-status'),
    path('verify-otp/', OTPVerificationView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
]
