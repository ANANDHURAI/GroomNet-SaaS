import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';
import Carousel from '../../components/basics/Carousel';
import CCard from '../../components/basics/Ccard';
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
    console.log('Requesting location permission...');
    
    try {
      const locationData = await getCurrentLocation();
      console.log('Location obtained:', locationData);
    
      const response = await apiClient.post('/customersite/user-location/', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy
      });
      
      console.log('Server response:', response.data);
    
      setLocation(locationData);
      setLocationError('');
      sessionStorage.setItem('locationSent', 'true');
      setShowLocationModal(false);
      
    } catch (err) {
      console.error('Location error:', err);
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
      console.error('Home data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LocationModal 
        isOpen={showLocationModal}
        onEnableLocation={handleEnableLocation}
        onDismiss={handleDismissLocation}
      />

      {locationError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex items-center">
            <div className="ml-3 text-sm text-yellow-700">
              <p className="font-medium">Location Error</p>
              <p>{locationError}</p>
              <button 
                onClick={handleEnableLocation} 
                className="mt-2 text-yellow-800 underline hover:text-yellow-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to GroomNet
              </h1>
              {data?.greeting_message && (
                <p className="text-lg text-gray-600">{data.greeting_message}</p>
              )}
              {location && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Location enabled - 
                  {currentUser?.user_type === 'customer' 
                    ? ' Showing nearby services' 
                    : ' Ready to receive bookings'
                  }
                </p>
              )}
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {currentUser.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
                  <p className="text-xs text-blue-600 capitalize">
                    {currentUser.user_type}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ShowType />
        <br />

        {loading && (
          <LoadingSpinner size="large" text="Loading your dashboard..." />
        )}
        
        {error && (
          <ErrorMessage error={error} onRetry={fetchHomeData} />
        )}

        {data?.categories?.length > 0 && (
          <Carousel title="Categories">
            {data.categories.map((cat) => (
              <CCard key={cat.id} category={cat} />
            ))}
          </Carousel>
        )}

        {data?.services?.length > 0 && (
          <Carousel title="Our Services">
            {data.services.map((srv) => (
              <SCard key={srv.id} service={srv} />
            ))}
          </Carousel>
        )}

        {data && !data.categories?.length && !data.services?.length && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No categories or services available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;