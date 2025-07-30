# services.py
from django.conf import settings
from django.shortcuts import redirect
from django.core.exceptions import ValidationError
from urllib.parse import urlencode
from typing import Dict, Any
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

GOOGLE_ACCESS_TOKEN_OBTAIN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
LOGIN_URL = f'{settings.BASE_APP_URL}/login'

def google_get_access_token(code: str, redirect_uri: str) -> str:
    """Exchange authorization code for access token"""
    data = {
        'code': code,
        'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
        'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    }

    response = requests.post(GOOGLE_ACCESS_TOKEN_OBTAIN_URL, data=data)
    if not response.ok:
        print(f"Google token error: {response.text}")  # Debug logging
        raise ValidationError(f'Could not get access token from Google. Response: {response.text}')
    
    access_token = response.json()['access_token']
    return access_token

def google_get_user_info(access_token: str) -> Dict[str, Any]:
    """Get user info from Google using access token"""
    response = requests.get(
        GOOGLE_USER_INFO_URL,
        params={'access_token': access_token}
    )

    if not response.ok:
        print(f"Google user info error: {response.text}")  # Debug logging
        raise ValidationError('Could not get user info from Google.')
    
    return response.json()

def process_google_auth(code: str):
    """Process Google OAuth and return user data"""
    try:
        # Use the exact redirect URI that matches Google Console
        redirect_uri = f"{settings.BASE_API_URL}/auth/login/google/"
        
        access_token = google_get_access_token(code=code, redirect_uri=redirect_uri)
        user_data = google_get_user_info(access_token=access_token)

        print(f"Google user data: {user_data}")  # Debug logging

        # Get or create user
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'name': user_data.get('name', user_data['email']),
                'user_type': 'customer',  # Default to customer
                'is_verified': True,  # Google users are pre-verified
            }
        )
        
        print(f"User created: {created}, User: {user}")  # Debug logging
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return {
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'user_type': user.user_type,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'profileimage': user.profileimage.url if user.profileimage else None
            },
            'access': str(access_token),
            'refresh': str(refresh),
        }
        
    except Exception as e:
        print(f"Google auth processing error: {str(e)}")  # Debug logging
        raise e