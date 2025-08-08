import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const otp = location.state?.otp;

    useEffect(() => {
        if (!email || !otp) {
            navigate('/forget-password');
        }
    }, [email, otp, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/auth/reset-password/', {
                email: email,
                otp: otp,
                new_password: newPassword,
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Reset password error:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                error.response?.data?.otp?.[0] ||
                'Failed to reset password. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!email || !otp) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-300/20 text-gray-900">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
                    <p className="text-blue-900">Enter and confirm your new password</p>
                </div>

                {success ? (
                    <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg mb-4">
                        <p className="text-green-800 text-sm">Password reset successful! Redirecting...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            type="password"
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                            minLength={6}
                        />
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            type="password"
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                            minLength={6}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-blue-400 disabled:to-teal-400 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting...
                                </span>
                            ) : 'Reset Password'}
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-blue-800 text-sm">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-200"
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
