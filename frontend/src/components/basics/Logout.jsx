import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import { logout } from '../../slices/auth/LoginSlice';

function Logout({ className = "" }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    sessionStorage.removeItem('barber_id');
    sessionStorage.removeItem('customer_profile_image');
    const refresh_token = sessionStorage.getItem('refresh_token');
    const user_type = sessionStorage.getItem('user_type');

    try {
      if (refresh_token && user_type) {
        await apiClient.post('/auth/logout/', {
          refresh_token,
          user_type,
        });
        console.log('Logout API successful');
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      dispatch(logout());

      if (user_type === 'admin') {
        navigate('/admin-login');
      } else {
        navigate('/login');
      }

      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300
        ${loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'}
        ${className}
      `}
    >
      <span className="flex items-center space-x-2">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Logging out...</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </>
        )}
      </span>
    </button>
  );
}

export default Logout;
