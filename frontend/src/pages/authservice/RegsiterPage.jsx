import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import { setRegisterData } from '../../slices/auth/RegisterSlice';
import * as Yup from 'yup';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const registerSchema = Yup.object().shape({
    name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
    email: Yup.string().trim().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^\d{10}$/, 'Phone must be 10 digits').required('Phone is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    setError('');
    setValidationErrors({});

    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setLoading(true);

      const response = await apiClient.post('/auth/register/', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        user_type: 'customer',
      });

      if (response.data.email) {
        dispatch(setRegisterData(formData));
        sessionStorage.setItem('pending_email', response.data.email);
        navigate('/otp');
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = {};
        err.inner.forEach(e => {
          errors[e.path] = e.message;
        });
        setValidationErrors(errors);
      } else {
        const errorData = err.response?.data;
        if (errorData && typeof errorData === 'object') {
          const messages = Object.entries(errorData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
          setError(messages.join('\n'));
        } else {
          setError(errorData?.error || errorData?.message || 'Registration failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-300/20 text-gray-900">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Join GroomNet</h2>
          <p className="text-blue-900">Create your customer account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm whitespace-pre-line text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {validationErrors.name && <p className="text-red-500 text-sm">{validationErrors.name}</p>}

          <input
            placeholder="Email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            type="email"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email}</p>}

          <input
            placeholder="Phone Number"
            value={formData.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            type="tel"
            maxLength="10"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {validationErrors.phone && <p className="text-red-500 text-sm">{validationErrors.phone}</p>}

          <input
            placeholder="Password"
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            type="password"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {validationErrors.password && <p className="text-red-500 text-sm">{validationErrors.password}</p>}

          <input
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            type="password"
            className="w-full px-4 py-3 bg-white/70 backdrop-blur border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {validationErrors.confirmPassword && <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-blue-800 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-200"
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
