import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Input from '../../components/basics/Input';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import { setRegisterData } from '../../slices/auth/RegisterSlice';
import * as Yup from 'yup';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const registerSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .required('Name is required'),
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long')
      .required('Password is required'),
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
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
        user_type: 'customer'
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
       
        console.error("Registration error", err);
        const errorData = err.response?.data;
        if (errorData) {
          if (typeof errorData === 'object') {
            const errorMessages = [];
            Object.keys(errorData).forEach(key => {
              if (Array.isArray(errorData[key])) {
                errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
              } else {
                errorMessages.push(`${key}: ${errorData[key]}`);
              }
            });
            setError(errorMessages.join('\n'));
          } else {
            setError(errorData.error || errorData.message || 'Registration failed');
          }
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in here
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Input
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Full Name"
                autoComplete="off"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <Input
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="Email Address"
                type="email"
                autoComplete="off"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <Input
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="Phone Number (10 digits)"
                type="tel"
                maxLength="10"
                autoComplete="off"
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <Input
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder="Password (min 8 characters)"
                type="password"
                autoComplete="new-password"
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
