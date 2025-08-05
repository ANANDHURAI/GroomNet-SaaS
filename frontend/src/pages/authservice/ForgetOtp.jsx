import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';

function ForgetOtp() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    React.useEffect(() => {
        if (!email) {
            navigate('/forget-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/verify-otp/', {
                email: email,
                otp: otp
            });
            
            navigate('/reset-password', { state: { email, otp } });
        } catch (error) {
            console.error('OTP verification error:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Invalid OTP. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setError('');

        try {
            await apiClient.post('/auth/forgot-password/', {
                email: email,
            });
            setError(''); 
            
        } catch (error) {
            console.error('Resend OTP error:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to resend OTP. Please try again.';
            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    if (!email) {
        return null; 
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-300/20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
                    <p className="text-blue-200">Enter the 4-digit OTP sent to</p>
                    <p className="text-blue-300 font-semibold">{email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="Enter 4-digit OTP"
                            type="text"
                            maxLength="4"
                            className="w-full px-4 py-3 bg-white/20 backdrop-blur border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 4}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-blue-400 disabled:to-teal-400 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </span>
                        ) : 'Verify OTP'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                        <p className="text-red-200 text-sm text-center">{error}</p>
                    </div>
                )}

                <div className="mt-6 text-center space-y-2">
                    <button
                        onClick={handleResendOtp}
                        disabled={resendLoading}
                        className="text-blue-300 hover:text-white font-semibold transition-colors duration-200 disabled:opacity-50"
                    >
                        {resendLoading ? 'Resending...' : 'Resend OTP'}
                    </button>
                    <p className="text-blue-200 text-sm">
                        <button
                            onClick={() => navigate('/forget-password')}
                            className="text-blue-300 hover:text-white font-semibold transition-colors duration-200"
                        >
                            Back to Email
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgetOtp;