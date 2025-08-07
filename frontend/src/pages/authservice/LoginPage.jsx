import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; 
import { login } from '../../slices/auth/LoginSlice';
import apiClient from '../../slices/api/apiIntercepters';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const initializeGoogleAuth = () => {
            if (window.google) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        use_fedcm_for_prompt: false, 
                    });

                    window.google.accounts.id.renderButton(
                        document.getElementById('google-signin-button'),
                        {
                            theme: 'outline',
                            size: 'large',
                            width: '100%',
                            text: 'continue_with'
                        }
                    );
                } catch (error) {
                    console.error('Google Sign-In initialization error:', error);
                    setError('Google Sign-In initialization failed');
                }
            }
        };

        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleAuth;
            script.onerror = () => {
                console.error('Failed to load Google Sign-In script');
                setError('Failed to load Google Sign-In');
            };
            document.body.appendChild(script);
        } else {
            initializeGoogleAuth();
        }

 
        return () => {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                script.remove();
            }
        };
    }, []);

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

    const handleGoogleResponse = async (response) => {
        console.log('Google response received:', response);
        setGoogleLoading(true);
        setError('');

        try {
            const result = await apiClient.post('/auth/google-login/', {
                credential: response.credential
            });

            console.log('Backend response:', result.data);

            const { access, refresh, user } = result.data;
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
            console.error('Google login error:', error);
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Google authentication failed';
            setError(errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-300/20 text-gray-900">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to GroomNet</h2>
                    <p className="text-blue-900">Sign in to your account</p>
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
                            disabled={loading || googleLoading}
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                        />
                        <input
                            name="login_pass"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            type="password"
                            disabled={loading || googleLoading}
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                        />

                        <div className="flex justify-end">
                            <Link
                                to="/forget-password"
                                className="text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
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

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-blue-300/30"></div>
                    <span className="px-4 text-blue-700 text-sm">or</span>
                    <div className="flex-1 border-t border-blue-300/30"></div>
                </div>

                <div id="google-signin-button" className="w-full"></div>

                {googleLoading && (
                    <div className="mt-4 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-2 text-blue-700">Signing in with Google...</span>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-700 text-sm text-center">{error}</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-blue-800 text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-200"
                            disabled={loading || googleLoading}
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