from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import (
    LogoutView, RegisterView, OTPVerification, 
    AdminLogin, AdminDashboard, CustomerBarberLogin ,ResetPasswordView ,ForgotPasswordView , VerifyOTPView
)

urlpatterns = [
    # JWT Authentication
    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    # Core Views
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('otp-verification/', OTPVerification.as_view(), name='otp-verification'),

    # Login routes
    path('customer-barber-login/', CustomerBarberLogin.as_view(), name='customer-barber-login'),
    path('admin-login/', AdminLogin.as_view(), name='admin-login'),
    path('admin-dashboard/', AdminDashboard.as_view(), name='admin-dashboard'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
]