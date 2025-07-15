import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RefreshCw, CheckCircle, Clock, XCircle, AlertCircle, Upload } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import { login } from '../../slices/auth/LoginSlice';

function BarberStatus() {
  const [userData, setUserData] = useState(null);
  const [nextStep, setNextStep] = useState('');
  const [canContinue, setCanContinue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('barber-reg/registration-status/');
      const data = response.data;
      
      setUserData(data.user_data || null);
      setNextStep(data.next_step);
      setCanContinue(data.can_continue);

      if (data.user_data?.status === 'approved') {
        const storedUserData = sessionStorage.getItem('user_data');
        const storedAccessToken = sessionStorage.getItem('access_token');
        const storedRefreshToken = sessionStorage.getItem('refresh_token');
        
        if (storedUserData) {
          try {
            const currentUser = JSON.parse(storedUserData);
            const updatedUser = {
              ...currentUser,
              is_verified: true,
              is_active: true
            };
            
            sessionStorage.setItem('user_data', JSON.stringify(updatedUser));
            dispatch(login({
              user: updatedUser,
              access: storedAccessToken,
              refresh: storedRefreshToken
            }));
          } catch (parseError) {
            console.error('Error updating user data:', parseError);
          }
        }
      }
    } catch (err) {
      console.error('Status fetch error:', err);
      const status = err.response?.status;
      
      if (status === 404) {
        setUserData(null);
        setNextStep('personal_details');
        setCanContinue(true);
        setError('No registration found. Please start with personal details.');
      } else {
        setError('Failed to fetch registration status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  const handleEnterDashboard = () => {
    if (userData?.status === 'approved') {
      setTimeout(() => {
        navigate('/login');
      }, 100);
    } else {
      navigate('/barber-dash');
    }
  };

  const handleStartRegistration = () => navigate('/barber-registration');
  const handleTryAgain = () => navigate('/barber-registration');
  
  const handleContinueRegistration = () => {
    if (nextStep === 'documents_uploaded') {
      navigate('/barber-document-upload');
    } else {
      navigate('/barber-registration');
    }
  };

  const getStatusInfo = () => {
    if (!userData) {
      return {
        title: 'Not Registered',
        message: 'Start your barber registration process to join our platform.',
        color: 'gray',
        icon: AlertCircle
      };
    }

    const { status } = userData;
    const statusMap = {
      pending: {
        title: 'Under Review',
        message: 'Your documents are being reviewed by our admin team.',
        color: 'yellow',
        icon: Clock
      },
      approved: {
        title: 'Approved',
        message: 'Congratulations! Your registration has been approved.',
        color: 'green',
        icon: CheckCircle
      },
      rejected: {
        title: 'Rejected',
        message: 'Your registration was rejected. Please check admin comments.',
        color: 'red',
        icon: XCircle
      }
    };

    return statusMap[status] || {
      title: 'Unknown Status',
      message: 'Please contact support for assistance.',
      color: 'gray',
      icon: AlertCircle
    };
  };

  const getProgressPercentage = () => {
    if (!userData) return 0;
    
    const stepMap = {
      personal_details: 25,
      documents_uploaded: 75,
      under_review: 90,
      completed: 100
    };
    
    return stepMap[userData.registration_step] || 10;
  };

  const formatStepName = (step) => {
    return step?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const canContinueToDocuments = () => {
      return canContinue && nextStep === 'upload_documents';
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const progress = getProgressPercentage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Registration Status</h1>
            <p className="text-gray-600">Track your barber registration progress</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <StatusIcon className={`w-8 h-8 mr-3 text-${statusInfo.color}-500`} />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{statusInfo.title}</h3>
                  <p className="text-gray-600">{statusInfo.message}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                {userData?.status?.toUpperCase() || 'NOT REGISTERED'}
              </span>
            </div>

            {userData && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Current Step:</span>
                  <span className="font-medium">{formatStepName(userData.registration_step)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Step:</span>
                  <span className="font-medium">{formatStepName(nextStep)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents Complete:</span>
                  <span className="font-medium">{userData.documents_complete ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Registration Started</span>
              <span>Documents Uploaded</span>
              <span>Under Review</span>
              <span>Completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">{progress}% Complete</p>
          </div>

         
          {userData?.admin_comment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Admin Comment:</h4>
              <p className="text-yellow-700 text-sm">{userData.admin_comment}</p>
            </div>
          )}

          <div className="flex justify-between flex-wrap gap-4">
            {userData ? (
              userData.status === 'approved' ? (
                <button
                  onClick={handleEnterDashboard}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Login
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                      refreshing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Status'}
                  </button>
                  
                  {canContinueToDocuments() && (
                    <button
                      onClick={handleContinueRegistration}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      <Upload className="w-4 h-4" />
                      Continue Registration
                    </button>
                  )}
                  
                  {userData.status === 'rejected' && (
                    <button
                      onClick={handleTryAgain}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Try Again
                    </button>
                  )}
                </>
              )
            ) : (
              <button
                onClick={handleStartRegistration}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Start Registration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarberStatus;