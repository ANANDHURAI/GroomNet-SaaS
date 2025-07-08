from rest_framework import serializers
from authservice.models import User 
from .models import CategoryModel , ServiceModel , AdminWallet

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


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = ServiceModel
        fields = '__all__'
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.category:
            representation['category'] = {
                'id': instance.category.id,
                'name': instance.category.name,
                'image': instance.category.image.url if instance.category.image else None,
                'is_blocked': instance.category.is_blocked
            }
        return representation


class AdminWalletSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    
    class Meta:
        model = AdminWallet
        fields = ['id', 'total_earnings', 'last_updated', 'amount']
        read_only_fields = ['id', 'last_updated']
