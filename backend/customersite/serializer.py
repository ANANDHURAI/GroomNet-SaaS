from rest_framework import serializers
from adminsite.models import CategoryModel, ServiceModel
from .models import Booking , PaymentModel
from authservice.models import User
from barbersite.models import BarberSlot
from profileservice.models import Address
from django.db import transaction
from decimal import Decimal

class BarberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'profileimage']
    

class AvailableSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarberSlot
        fields = ['id', 'date', 'start_time', 'end_time']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'name', 'mobile', 'building', 'street', 'city', 'district', 'state', 'pincode', 'is_default']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        address = super().create(validated_data)

        full_address = f"{address.building}, {address.street}, {address.city}, {address.district}, {address.state}, {address.pincode}"
        lat, lng = get_lat_lng_from_address(full_address)
        print("latitude and langitut",lat,lng)

        if lat and lng:
            profile, _ = user.profile.get_or_create(user=user)
            profile.latitude = lat
            profile.longitude = lng
            profile.address = address
            profile.save()
        
        return address


class BookingCreateSerializer(serializers.ModelSerializer):
    payment_method = serializers.ChoiceField(choices=['COD', 'STRIPE', 'WALLET'])
    slot = serializers.PrimaryKeyRelatedField(
        queryset=BarberSlot.objects.all(), required=False, allow_null=True
    )
    barber = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='barber'), required=False, allow_null=True
    )

    class Meta:
        model = Booking
        fields = ['service', 'barber', 'slot', 'address', 'payment_method']

    def validate(self, data):
        request = self.context['request']
        booking_type = (
            request.data.get('booking_type') or
            request.session.get('booking_type')
        )
        if not booking_type:
            raise serializers.ValidationError("Booking type is required.")

        if booking_type not in ["INSTANT_BOOKING", "SCHEDULE_BOOKING"]:
            raise serializers.ValidationError({
                "booking_type": "Invalid booking type. Must be one of: ['INSTANT_BOOKING', 'SCHEDULE_BOOKING']"
            })

        payment_method = data.get('payment_method')
        if booking_type == "SCHEDULE_BOOKING" and payment_method == "COD":
            raise serializers.ValidationError({
                "payment_method": "Cash on Delivery is not allowed for scheduled bookings."
            })

        if booking_type == "SCHEDULE_BOOKING":
            if not data.get('slot'):
                raise serializers.ValidationError({"slot": "Slot is required for scheduled bookings."})
            if not data.get('barber'):
                raise serializers.ValidationError({"barber": "Barber is required for scheduled bookings."})

        if booking_type == "INSTANT_BOOKING":
            data['slot'] = None
            data['barber'] = None

        self.context['booking_type'] = booking_type
        return data

    def create(self, validated_data):
        request = self.context['request']
        booking_type = self.context['booking_type']
        customer = request.user
        payment_method = validated_data.pop('payment_method')
        service = validated_data['service']
        slot = validated_data.get('slot')

        service_amount = Decimal(str(service.price))
        platform_fee = (service_amount * Decimal('0.05')).quantize(Decimal('0.01'))
        total_amount = service_amount + platform_fee

        with transaction.atomic():
            if booking_type == "SCHEDULE_BOOKING":
                if slot and slot.is_booked:
                    raise serializers.ValidationError("This slot is already booked.")
                if slot:
                    slot.is_booked = True
                    slot.save()
                    
            status = 'PENDING' if booking_type == "INSTANT_BOOKING" else 'CONFIRMED'

            booking = Booking.objects.create(
                customer=customer,
                total_amount=total_amount,
                is_payment_done=(payment_method in ['COD', 'WALLET']),
                status=status,
                booking_type=booking_type,
                **validated_data
            )

            PaymentModel.objects.create(
                booking=booking,
                payment_method=payment_method,
                payment_status='SUCCESS' if payment_method == 'WALLET' else 'PENDING',
                service_amount=service_amount,
                platform_fee=platform_fee
            )

        return booking


class BookingSummarySerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    barber_name = serializers.CharField(source='barber.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    slot_date = serializers.DateField(source='slot.date', read_only=True)
    slot_time = serializers.CharField(source='slot.start_time', read_only=True)
    address_full = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'service_name', 'barber_name', 'customer_name', 
            'slot_date', 'slot_time', 'total_amount', 'payment_method', 
            'status', 'address_full', 'created_at'
        ]
    
    def get_address_full(self, obj):
        return f"{obj.address.building}, {obj.address.street}, {obj.address.city}, {obj.address.state} - {obj.address.pincode}"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryModel
        fields = ['id', 'name', 'image']


class ServiceSerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = ServiceModel
        fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'image', 'category']


class HomeSerializer(serializers.Serializer):
    greeting_message = serializers.CharField()
    categories = CategorySerializer(many=True)
    services = ServiceSerializer(many=True)

class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.name', read_only=True)
    service_name = serializers.CharField(source='booking.service.name', read_only=True)
    
    class Meta:
        model = PaymentModel
        fields = [
            'id', 'transaction_id', 'payment_status',
            'created_at', 'updated_at',
            'booking_id', 'customer_name', 'service_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']