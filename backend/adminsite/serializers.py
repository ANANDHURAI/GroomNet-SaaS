from rest_framework import serializers
from authservice.models import User 
from .models import CategoryModel , ServiceModel , AdminWallet , Coupon ,AdminWalletTransaction , ServiceRequestModel
from customersite.models import Complaints

class UsersListSerializer(serializers.ModelSerializer):
    profileimage_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'profileimage_url', 'user_type', 'is_blocked', 'created_at', 'is_active']
    
    def get_profileimage_url(self, obj):
        if obj.profileimage:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profileimage.url)
            return obj.profileimage.url
        return None
    
    
class BarbersListSerializer(serializers.ModelSerializer):
    profileimage_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'profileimage_url', 'user_type', 'is_blocked', 'created_at', 'is_active']
    
    def get_profileimage_url(self, obj):
        if obj.profileimage:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profileimage.url)
            return obj.profileimage.url
        return None
    


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryModel
        fields = '__all__'
       
        extra_kwargs = {'image': {'required': False}}

    def validate_name(self, value):
     
        qs = CategoryModel.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise serializers.ValidationError("Category with this name already exists.")
        return value





class ServiceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = ServiceModel
        fields = '__all__'
        extra_kwargs = {'image': {'required': False}}

    def validate_name(self, value):
        qs = ServiceModel.objects.filter(name__iexact=value)

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "Service with this name already exists."
            )
        return value 
    


class AdminWalletSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    
    class Meta:
        model = AdminWallet
        fields = ['id', 'total_earnings', 'last_updated', 'amount']
        read_only_fields = ['id', 'last_updated']

class CouponSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'expiry_date',
            'service',
            'service_name',
            'discount_percentage',
            'is_active',
        ]


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaints
        fields = '__all__'

class AdminWalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminWalletTransaction
        fields = ['id', 'amount', 'note', 'created_at']

    
class ServiceRequestSerializer(serializers.ModelSerializer):
    barber_name = serializers.CharField(source='barber.name', read_only=True)
    barber_email = serializers.CharField(source='barber.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_image = serializers.ImageField(source='category.image', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True)
    
    class Meta:
        model = ServiceRequestModel
        fields = [
            'id', 'barber', 'barber_name', 'barber_email',
            'category', 'category_name', 'category_image',
            'name', 'description', 'price', 'duration_minutes',
            'image', 'status', 'admin_notes',
            'created_at', 'updated_at', 'approved_at',
            'approved_by', 'approved_by_name'
        ]
        read_only_fields = ['barber', 'status', 'admin_notes', 'approved_at', 'approved_by']

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

class ServiceRequestDetailSerializer(ServiceRequestSerializer):
    barber_profile = serializers.SerializerMethodField()
    
    class Meta(ServiceRequestSerializer.Meta):
        fields = ServiceRequestSerializer.Meta.fields + ['barber_profile']
    
    def get_barber_profile(self, obj):
        return {
            'id': obj.barber.id,
            'name': obj.barber.name,
            'email': obj.barber.email,
            'phone': obj.barber.phone,
            'gender': obj.barber.gender,
            'profileimage': obj.barber.profileimage.url if obj.barber.profileimage else None,
            'created_at': obj.barber.created_at,
            'is_verified': obj.barber.is_verified
        }
