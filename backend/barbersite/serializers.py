from rest_framework import serializers
from adminsite.models import ServiceRequestModel
from adminsite.serializers import ServiceSerializer
from .models import BarberSlot, BarberSlotBooking ,BarberWallet, WalletTransaction, Portfolio , BarberService


class BarberSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarberSlot
        fields = '__all__'

class BarberSlotBookingSerializer(serializers.ModelSerializer):
    slot = BarberSlotSerializer()

    class Meta:
        model = BarberSlotBooking
        fields = '__all__'

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = '__all__' 
       

class BarberServiceSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = BarberService
        fields = ['id', 'service', 'service_id', 'is_active', 'created_at']
    
    def create(self, validated_data):
        validated_data['barber'] = self.context['request'].user
        return super().create(validated_data)
    


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'note', 'created_at']

class BarberWalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = BarberWallet
        fields = ['balance', 'updated_at', 'transactions']




class ServiceRequestCreateSerializer(serializers.ModelSerializer): 
    class Meta:
        model = ServiceRequestModel
        fields = [
            'category', 'name', 'description', 
            'price', 'duration_minutes', 'image'
        ]

    def validate_category(self, value):
        if value.is_blocked:
            raise serializers.ValidationError("Cannot create request for blocked category")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_duration_minutes(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0 minutes")
        return value