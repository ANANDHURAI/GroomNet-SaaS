import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; 
import { login } from '../../slices/auth/LoginSlice';
import apiClient from '../../slices/api/apiIntercepters';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/customer-barber-login/', {
                email: email.trim().toLowerCase(),
                password,
            });

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
                setError('Access restricted to customers and barbers only');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Invalid credentials';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-300/20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome to GroomNet</h2>
                    <p className="text-blue-200">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                    <div className="space-y-4">
                        <input
                            name="login_email"
                            autoComplete="new-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/20 backdrop-blur border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        />
                        <input
                            name="login_pass"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white/20 backdrop-blur border border-blue-300/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        />

                        <div className="flex justify-end">
                            <Link
                                to="/forget-password"
                                className="text-sm text-blue-300 hover:text-white transition-colors duration-200"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-blue-400 disabled:to-teal-400 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                        <p className="text-red-200 text-sm text-center">{error}</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-blue-200 text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-300 hover:text-white font-semibold transition-colors duration-200"
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
