import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../slices/auth/LoginSlice';
import apiClient from '../../slices/api/apiIntercepters';

const GoogleLoginButton = ({ onError, onLoading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    
    if (onLoading) onLoading(true);
    try {
      const response = await apiClient.post('/auth/google/login/', {
        id_token: credential 
      });

      console.log('Google login successful:', response.data);
      
      const { access, refresh, user } = response.data;
      dispatch(login({ user, access, refresh }));

      if (user.user_type === 'customer') {
        navigate('/home');
      } else if (user.user_type === 'barber') {
        sessionStorage.setItem('barber_id', user.id);
        
        if (user.is_active && user.is_verified) {
          navigate('/barber-dash');
        } else {
          navigate('/barber-status');
        }
      } else {
        if (onError) onError('Access restricted to customers and barbers only');
      }

    } catch (error) {
      console.error('Google Login Failed:', error);
      const errorMessage = 
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        'Google login failed. Please try again.';
      
      if (onError) onError(errorMessage);
    } finally {
      if (onLoading) onLoading(false);
    }
  };

  const handleError = () => {
    console.log('Google Login Failed');
    if (onError) onError('Google login was cancelled or failed');
  };

  return (
    <div className="mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blue-300/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white/10 text-blue-200">Or continue with</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_blue"
          size="large"
          width="100%"
          logo_alignment="left"
        />
      </div>
    </div>
  );
};

export default GoogleLoginButton;