from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import BarberRequest
import re

User = get_user_model()

class BarberPersonalDetailsSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'phone', 'gender', 'password', 'confirm_password']

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords don't match."
            })
        
        attrs.pop('confirm_password')
        return attrs


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarberRequest
        fields = ['licence', 'certificate', 'profile_image']

    def validate(self, data):
        required_fields = ['licence', 'certificate', 'profile_image']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f'{field.replace("_", " ").title()} is required.'
                })

        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
        image_extensions = ['jpg', 'jpeg', 'png']

        for field_name in ['licence', 'certificate']:
            file = data.get(field_name)
            if file:
                extension = file.name.split('.')[-1].lower()
                if extension not in allowed_extensions:
                    raise serializers.ValidationError({
                        field_name: f"Only PDF and image files are allowed."
                    })
       
        profile_img = data.get('profile_image')
        if profile_img:
            extension = profile_img.name.split('.')[-1].lower()
            if extension not in image_extensions:
                raise serializers.ValidationError({
                    'profile_image': "Only image files (JPG, JPEG, PNG) are allowed."
                })

        return data


class BarberRegistrationStatusSerializer(serializers.ModelSerializer):
    registration_step = serializers.CharField(source='barber_request.registration_step', read_only=True)
    status = serializers.CharField(source='barber_request.status', read_only=True)
    admin_comment = serializers.CharField(source='barber_request.admin_comment', read_only=True)
    documents_complete = serializers.BooleanField(source='barber_request.is_documents_complete', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'registration_step', 'status', 'admin_comment', 'documents_complete']


class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value