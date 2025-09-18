from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from django.core.cache import cache

import re
from django.contrib.auth import get_user_model


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    user_type = serializers.ChoiceField(
        choices=[('customer', 'Customer')],
        default='customer'
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'phone', 'password', 'user_type']

    def validate_email(self, value):
       
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
       
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        if value in ["0000000000", "1111111111", "9999999999"]:
            raise serializers.ValidationError("Invalid phone number.")
        return value

    def validate_password(self, value):
      
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r"[@$!%*#?&]", value):
            raise serializers.ValidationError(
                "Password must contain at least one special character (@, $, !, %, *, #, ?, &)."
            )
        return value

    def validate_name(self, value):
 
        if not re.match(r'^[A-Za-z\s]+$', value):
            raise serializers.ValidationError("Name should only contain alphabets and spaces.")
        return value.title()


class OtpSerializer(serializers.Serializer):
    otp = serializers.IntegerField(min_value=1000, max_value=9999)
    
    def validate_otp(self, value):
        if not (1000 <= value <= 9999):
            raise serializers.ValidationError("OTP must be a 4-digit number.")
        return value



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'No account found with this email'})
        
        if user.is_blocked:
            raise serializers.ValidationError({'detail': 'Account is temporarily blocked'})
        
        authenticated_user = authenticate(email=email, password=password)
        if not authenticated_user:
            raise serializers.ValidationError({'detail': 'Invalid password'})

        attrs['user'] = authenticated_user
        return attrs


class AdminLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        user = attrs['user']
        
        if user.user_type != 'admin':
            raise serializers.ValidationError({'detail': 'Access restricted to admin users only'})
        
        return attrs


class CustomerBarberLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        user = attrs['user']
        
        if user.user_type not in ['customer', 'barber']:
            raise serializers.ValidationError({
                'detail': 'Access restricted to customers and barbers only'
            })
        
        return attrs

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email not found.")
        return value

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=4)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=4)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')
        cached_otp = cache.get(f"otp_{email}")

        if not cached_otp:
            raise serializers.ValidationError({"otp": "OTP expired. Please request a new OTP."})

        if cached_otp != otp:
            raise serializers.ValidationError({"otp": "Invalid OTP."})

        return data
    

class GoogleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'phone', 'user_type', 
            'gender', 'is_active', 'is_verified', 'created_at', 
            'profileimage'
        ]
        read_only_fields = ['id', 'created_at']

