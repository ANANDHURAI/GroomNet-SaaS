from rest_framework import serializers
from .models import UserProfile,Address
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
   
    name = serializers.CharField(source='user.name')
    email = serializers.CharField(source='user.email', read_only=True) 
    phone = serializers.CharField(source='user.phone', required=False)
    usertype = serializers.CharField(source='user.user_type', read_only=True)
    profileimage = serializers.ImageField(source='user.profileimage', required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = [
            'name',
            'email',
            'phone',
            'profileimage',
            'usertype',
            'date_of_birth',
            'gender',
            'bio',
        ]

    def update(self, instance, validated_data):
        
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if 'name' in user_data:
            user.name = user_data['name']
        
        if 'phone' in user_data:
            user.phone = user_data['phone']
            
        if 'profileimage' in user_data:
            user.profileimage = user_data['profileimage']
            
        user.save()

    
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