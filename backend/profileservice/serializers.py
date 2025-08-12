from rest_framework import serializers
from .models import UserProfile, Address
from authservice.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    profileimage = serializers.ImageField(source='user.profileimage', required=False)
    usertype = serializers.CharField(source='user.user_type', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['name', 'email', 'phone', 'profileimage', 'usertype', 'date_of_birth', 'gender']
    
    def get_profileimage(self, obj):
        if obj.user.profileimage and hasattr(obj.user.profileimage, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profileimage.url)
            else:
                return f"http://localhost:8000{obj.user.profileimage.url}"
        return None
    
    def update(self, instance, validated_data):
        user_data = {}
        if 'user' in validated_data:
            user_data = validated_data.pop('user')

        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'name',
            'mobile',
            'building',
            'street',
            'city',
            'district',
            'state',
            'pincode',
            'is_default',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)