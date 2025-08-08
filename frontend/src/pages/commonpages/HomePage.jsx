import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';
import Carousel from '../../components/basics/Carousel';
import CCard from '../../components/basics/CCard';
import SCard from '../../components/basics/Scard';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import { ErrorMessage } from '../../components/admincompo/categoryCom/ErrorMessage';
import ShowType from '../../components/customercompo/ShowType';
import LocationModal from '../../components/basics/LocationModal';
import { getCurrentLocation } from '../../utils/getCurrentLocation';

function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState(null);
  
  const user = useSelector(state => state.login.user);
  const registerUser = useSelector(state => state.register?.user);
  const currentUser = user || registerUser;

  useEffect(() => {
    if (!sessionStorage.getItem('locationSent')) {
      const timer = setTimeout(() => setShowLocationModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableLocation = async () => {
    try {
      const locationData = await getCurrentLocation();
      const response = await apiClient.post('/customersite/user-location/', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy
      });
      
      setLocation(locationData);
      setLocationError('');
      sessionStorage.setItem('locationSent', 'true');
      setShowLocationModal(false);
    } catch (err) {
      setLocationError(typeof err === 'string' ? err : 'Failed to get location');
    }
  };

  const handleDismissLocation = () => {
    setShowLocationModal(false);
    sessionStorage.setItem('locationSent', 'dismissed');
  };

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/customersite/home/');
      setData(response.data);
    } catch (err) {
      setError('Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />
      
      <LocationModal 
        isOpen={showLocationModal}
        onEnableLocation={handleEnableLocation}
        onDismiss={handleDismissLocation}
      />

      {locationError && (
        <div className="mx-4 mt-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-1">Location Error</h3>
                <p className="text-amber-700 mb-3">{locationError}</p>
                <button
                  onClick={handleEnableLocation}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Welcome Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/10 p-8 mb-12 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-semibold text-purple-700 mb-4">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                Welcome to the future of grooming
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                  GroomNet
                </span>
              </h1>
              
              {data?.greeting_message && (
                <p className="text-xl text-gray-600 mb-4 leading-relaxed max-w-2xl">
                  {data.greeting_message}
                </p>
              )}
              
              {location && (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-sm font-medium text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Location enabled - 
                  {currentUser?.user_type === 'customer'
                    ? ' Showing nearby services'
                    : ' Ready to receive bookings'
                  }
                </div>
              )}
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-bold text-xl">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {currentUser.name || 'User'}
                  </p>
                  <p className="text-gray-600">{currentUser.email}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-xs font-semibold text-blue-700 mt-1 capitalize">
                    {currentUser.user_type}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <ShowType />

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" text="Loading your dashboard..." />
          </div>
        )}

        {error && (
          <div className="mb-8">
            <ErrorMessage error={error} onRetry={fetchHomeData} />
          </div>
        )}

        {data?.categories?.length > 0 && (
          <div className="mb-12">
            <Carousel title="Explore Categories">
              {data.categories.map((cat) => (
                <CCard key={cat.id} category={cat} />
              ))}
            </Carousel>
          </div>
        )}

        {data?.services?.length > 0 && (
          <div className="mb-12">
            <Carousel title="Featured Services">
              {data.services.map((srv) => (
                <SCard key={srv.id} service={srv} />
              ))}
            </Carousel>
          </div>
        )}

        {data && !data.categories?.length && !data.services?.length && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 8h10M7 12h4m1 8l-1-1h1v1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              We're preparing amazing categories and services for you. Stay tuned!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
