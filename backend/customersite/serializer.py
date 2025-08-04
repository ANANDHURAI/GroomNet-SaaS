from rest_framework import serializers
from adminsite.models import CategoryModel, ServiceModel,AdminWalletTransaction
from .models import Booking , PaymentModel , Complaints , CustomerWalletTransaction
from authservice.models import User
from barbersite.models import BarberSlot
from profileservice.models import Address
from django.db import transaction
from decimal import Decimal
from .utils import get_lat_lng_from_address
from profileservice.models import UserProfile
import requests
from django.db.models import Avg
from customersite.models import Rating
from.models import CustomerWallet

class BarberSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'profileimage', 'average_rating']

    def get_average_rating(self, obj):
        avg = Rating.objects.filter(barber=obj).aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg is not None else None
    

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


from adminsite.models import Coupon ,CouponUsage , AdminWallet

class BookingCreateSerializer(serializers.ModelSerializer):
    payment_method = serializers.ChoiceField(choices=['COD', 'STRIPE', 'WALLET'])
    slot = serializers.PrimaryKeyRelatedField(
        queryset=BarberSlot.objects.all(), required=False, allow_null=True
    )
    barber = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='barber'), required=False, allow_null=True
    )
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Booking
        fields = ['service', 'barber', 'slot', 'address', 'payment_method', 'coupon_code']

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
        coupon_code = validated_data.pop('coupon_code', None) 
        service = validated_data['service']
        slot = validated_data.get('slot')

        service_amount = Decimal(str(service.price))
        platform_fee = (service_amount * Decimal('0.05')).quantize(Decimal('0.01')) 

        discount = Decimal('0.00')
        coupon_obj = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(
                    code__iexact=coupon_code.strip(), 
                    is_active=True,
                    service=service
                )
                
                if not coupon.is_valid():
                    raise serializers.ValidationError({"coupon_code": "Coupon has expired."})
                
                if not coupon.can_user_use_coupon(customer):
                    raise serializers.ValidationError({"coupon_code": "You have reached the maximum usage limit for this coupon."})
                
                total_before_discount = service_amount + platform_fee
                discount = coupon.get_discount_amount(total_before_discount)
                coupon_obj = coupon

            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid coupon code or not applicable for this service."})

        total_amount = (service_amount + platform_fee - discount).quantize(Decimal('0.01'))

        with transaction.atomic():
            if booking_type == "SCHEDULE_BOOKING":
                if slot and slot.is_booked:
                    raise serializers.ValidationError("This slot is already booked.")
                if slot:
                    slot.is_booked = True
                    slot.save()

            if payment_method == "WALLET":
                wallet = CustomerWallet.objects.select_for_update().get(user=customer)
                if wallet.account_total_balance < total_amount:
                    raise serializers.ValidationError({"payment_method": "Your wallet doesn't have enough balance."})

                wallet.account_total_balance -= total_amount
                wallet.save()

                admin_wallet, _ = AdminWallet.objects.get_or_create(id=1, defaults={'total_earnings': Decimal('0.00')})
                admin_wallet.total_earnings += total_amount
                admin_wallet.save()

            status_value = 'PENDING' if booking_type == "INSTANT_BOOKING" else 'CONFIRMED'

            booking = Booking.objects.create(
                customer=customer,
                total_amount=total_amount,
                coupon=coupon_obj,
                is_payment_done=(payment_method in ['COD', 'WALLET']),
                status=status_value,
                booking_type=booking_type,
                **validated_data
            )

            PaymentModel.objects.create(
                booking=booking,
                payment_method=payment_method,
                payment_status='SUCCESS' if payment_method == 'WALLET' else 'PENDING',
                service_amount=service_amount,
                platform_fee=platform_fee,
                discount=discount,
                final_amount=total_amount,
            )
            if payment_method == "WALLET":
                AdminWalletTransaction.objects.create(
                    wallet=admin_wallet,
                    amount=total_amount,
                    note=f"Booking #{booking.id} - WALLET payment received"
                )

                CustomerWalletTransaction.objects.create(
                    wallet=wallet,
                    amount=-total_amount, 
                    note = f"Wallet payment for Booking #{booking.id} - {service.name}"
                )

            if coupon_obj:
                CouponUsage.objects.get_or_create(customer=customer, coupon=coupon_obj)
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

class CustomerWalletSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class LocationSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()

    def reverse_geocode(self, latitude, longitude):
        try:
            url = "https://nominatim.openstreetmap.org/reverse"
            params = {
                'format': 'json',
                'lat': latitude,
                'lon': longitude,
                'zoom': 18,
                'addressdetails': 1
            }
            headers = {'User-Agent': 'GroomNet/1.0 (anandhurai@gmail.com)'}

            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json().get('address', {})
                return {
                    'building': (data.get('house_number', '') + ' ' + data.get('road', '')).strip() or 'Current Location',
                    'street': data.get('suburb') or data.get('neighbourhood') or data.get('residential', 'Current Street'),
                    'city': data.get('city') or data.get('town') or data.get('village', 'Current City'),
                    'district': data.get('state_district') or data.get('county', 'Current District'),
                    'state': data.get('state', 'Current State'),
                    'pincode': data.get('postcode', '000000')
                }
        except Exception as e:
            print(f"Reverse geocode error: {e}")
        return {
            'building': 'Current Location',
            'street': 'Current Street',
            'city': 'Current City',
            'district': 'Current District',
            'state': 'Current State',
            'pincode': '000000'
        }
    
    def create(self, validated_data):
        user = self.context['request'].user
        latitude = validated_data['latitude']
        longitude = validated_data['longitude']

        address_data = self.reverse_geocode(latitude, longitude)

        address = Address.objects.filter(user=user, is_default=True).first()

        if address:
            for field, value in {**address_data, 'latitude': latitude, 'longitude': longitude}.items():
                setattr(address, field, value)
        else:
            address = Address.objects.create(
                user=user,
                is_default=True,
                latitude=latitude,
                longitude=longitude,
                **address_data
            )

        address.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.address = address
        profile.save()

        return {
            'message': 'Location updated successfully!',
            'user_type': user.user_type,
            'latitude': latitude,
            'longitude': longitude,
            **address_data
        }


from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    service_name = serializers.CharField(source='booking.service.name', read_only=True)
    barber_name = serializers.CharField(source='barber.name', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id', 'user', 'user_name', 'booking', 'barber', 'barber_name',
            'service_name', 'comment', 'rating', 'image', 'created_at'
        ]
        read_only_fields = ['user', 'barber', 'created_at']


    def validate(self, data):
        user = self.context['request'].user
        booking = data['booking']
        
        if Rating.objects.filter(user=user, booking=booking).exists():
            raise serializers.ValidationError("You have already rated this booking.")
        
        return data



class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaints
        fields = ['id', 'booking', 'complaint_name', 'description', 'image', 'complaint_status', 'created_at']
        read_only_fields = ['complaint_status', 'created_at', 'id']

class CustomerTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerWalletTransaction
        fields = ['id', 'amount', 'note', 'created_at']


