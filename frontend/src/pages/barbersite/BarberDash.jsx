import React, { useEffect, useState } from 'react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import apiClient from '../../slices/api/apiIntercepters';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import LocationModal from '../../components/basics/LocationModal';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import { MapPin, CheckCircle } from 'lucide-react';

function BarberDash() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const checkExistingLocation = async () => {
      try {
        const response = await apiClient.get('/customersite/user-location/check/');
        if (response.data.has_location) {
          setLocation({
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            address: response.data.address
          });
          sessionStorage.setItem('locationSent', 'true');
        } else {
    
          if (!sessionStorage.getItem('locationSent')) {
            const timer = setTimeout(() => setShowLocationModal(true), 1500);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.error('Error checking location:', err);
    
        if (!sessionStorage.getItem('locationSent')) {
          const timer = setTimeout(() => setShowLocationModal(true), 1500);
          return () => clearTimeout(timer);
        }
      }
    };

    checkExistingLocation();
  }, []);

  const handleEnableLocation = async () => {
    console.log('Barber requesting location permission...');
    
    try {
      const locationData = await getCurrentLocation();
      
      const response = await apiClient.post('/customersite/user-location/', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy
      });
      
      console.log('Server response:', response.data);

      setLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: {
          building: response.data.building,
          street: response.data.street,
          city: response.data.city,
          district: response.data.district,
          state: response.data.state,
          pincode: response.data.pincode
        }
      });
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

  useEffect(() => {
    apiClient.get('/barbersite/barber-dash/')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Barber dashboard fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <BarberSidebar />
      
      <LocationModal 
        isOpen={showLocationModal}
        onEnableLocation={handleEnableLocation}
        onDismiss={handleDismissLocation}
      />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {locationError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {data?.user?.name || 'Barber'}!
                </h1>
                <p className="text-gray-600 text-lg mb-2">{data?.user?.email}</p>
                
                {location ? (
                  <div className="flex items-center gap-2 text-green-600 mt-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Location enabled - Customers can find you nearby
                    </span>
                    {location.address && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({location.address.city}, {location.address.state})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 mt-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Enable location to receive bookings from nearby customers
                    </span>
                    <button
                      onClick={() => setShowLocationModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Enable Now
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-100 p-4 rounded-full">
                <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Status</h3>
              {location ? (
                <div className="text-green-600">
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <p className="text-sm">Location Active</p>
                  {location.address && (
                    <p className="text-xs text-gray-500 mt-1">
                      {location.address.city}, {location.address.state}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-amber-600">
                  <MapPin className="w-6 h-6 mb-2" />
                  <p className="text-sm">Location Needed</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Status</h3>
              <div className={location ? "text-green-600" : "text-gray-400"}>
                <p className="text-sm">
                  {location ? "Ready to receive bookings" : "Enable location to receive bookings"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-sm text-gray-600 capitalize">{data?.user?.user_type} Account</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BarberDash;