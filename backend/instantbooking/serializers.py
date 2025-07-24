# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from customersite.models import Booking

User = get_user_model()


class BarberActionSerializer(serializers.Serializer):
    ACTION_CHOICES = [
        ('accept', 'Accept'),
        ('reject', 'Reject'),
    ]
    
    action = serializers.ChoiceField(choices=ACTION_CHOICES)

    