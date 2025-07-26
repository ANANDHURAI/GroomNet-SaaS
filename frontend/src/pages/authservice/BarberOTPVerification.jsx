import React, { useState, useEffect } from 'react';
import { Mail, Shield, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import { useLocation, useNavigate } from 'react-router-dom';

function BarberOTPVerification({ email: propEmail, onVerificationSuccess, onGoBack }) {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ For redirecting after success
  const email = propEmail || location.state?.email;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) return;

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [email]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits' });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await apiClient.post('/barber-reg/verify-otp/', {
        email: email,
        otp: otpString
      });

      if (response.data.access) {
        sessionStorage.setItem('access_token', response.data.access);
        sessionStorage.setItem('refresh_token', response.data.refresh);
        sessionStorage.setItem('user_type', 'barber');
        sessionStorage.setItem('user_id', response.data.user_id);
      }

      setSuccessMessage('Email verified successfully!');

      setTimeout(() => {
        navigate('/barber-document-upload'); // ✅ Redirect here
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.error || 'Verification failed. Please try again.';
      setErrors({ otp: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setErrors({});

    try {
      await apiClient.post('/barber-reg/resend-otp/', { email });

      setSuccessMessage('New OTP sent to your email!');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setErrors({ general: message });
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <Mail className="w-4 h-4 mr-2" />
              <p className="text-sm">We've sent a code to {email}</p>
            </div>
            <p className="text-gray-500 text-sm">Enter the 6-digit code to continue</p>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-center space-x-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.otp
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-green-500'
                    } transition-colors`}
                  />
                ))}
              </div>
              {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-gray-600 mb-3">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {canResend ? 'You can resend OTP now' : `Resend OTP in ${formatTime(timer)}`}
              </span>
            </div>

            <button
              onClick={handleResendOTP}
              disabled={!canResend || resendLoading}
              className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Wrong email?{' '}
            <button
              onClick={onGoBack}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Go Back
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default BarberOTPVerification;
