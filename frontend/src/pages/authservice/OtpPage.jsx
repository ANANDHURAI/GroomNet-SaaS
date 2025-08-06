import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../components/basics/Input';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import { login } from '../../slices/auth/LoginSlice';
import { clearRegisterData } from '../../slices/auth/RegisterSlice';

function OtpPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registerData = useSelector(state => state.register);

  const handleOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    const email = sessionStorage.getItem('pending_email') || registerData.email;

    if (!email) {
      setError('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/otp-verification/', { 
        email, 
        otp: parseInt(otp) 
      });
      
      if (response.data.access && response.data.refresh) {
        sessionStorage.setItem('access_token', response.data.access);
        sessionStorage.setItem('refresh_token', response.data.refresh);
        sessionStorage.removeItem('pending_email');
        
        dispatch(login({ 
          email, 
          isLogin: true, 
          user: response.data.user 
        }));
        dispatch(clearRegisterData());
        
        navigate('/login');
      }
    } catch (error) {
      console.error("OTP verification error", error);
      setError(error.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 4-digit OTP sent to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleOtp} className="space-y-6">
            <Input
              value={otp}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value);
              }}
              placeholder="Enter 4-digit OTP"
              type="text"
              maxLength="4"
              className="appearance-none"
            />

            
            <button 
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtpPage;