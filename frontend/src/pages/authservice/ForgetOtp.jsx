import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Shield, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';

function ForgetOtp() {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) navigate('/forget-password');
        const countdown = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [email]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
        if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
        setError('');
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            setError('Please enter all 4 digits');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/verify-otp/', { email, otp: otpString });
            navigate('/reset-password', { state: { email, otp: otpString } });
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Invalid OTP. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        try {
            await apiClient.post('/auth/forgot-password/', { email });
            setSuccessMessage('OTP resent successfully!');
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '']);
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to resend OTP. Please try again.';
            setError(message);
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (sec) => {
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        return `${min}:${rem.toString().padStart(2, '0')}`;
    };

    if (!email) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-12 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>
                        <div className="flex items-center justify-center text-gray-600 mb-2">
                            <Mail className="w-4 h-4 mr-2" />
                            <p className="text-sm">OTP sent to {email}</p>
                        </div>
                        <p className="text-gray-500 text-sm">Enter the 4-digit code to continue</p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        error ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Verifying...
                                </div>
                            ) : (
                                'Verify OTP'
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
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Wrong email?{' '}
                        <button
                            onClick={() => navigate('/forget-password')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Go Back
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgetOtp;
