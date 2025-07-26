import React, { useEffect, useState } from 'react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import apiClient from '../../slices/api/apiIntercepters';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import LocationModal from '../../components/basics/LocationModal';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import {
  MapPin,
  CheckCircle,
  Star,
  Calendar,
  Wallet,
  Clock
} from 'lucide-react';

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
    try {
      const locationData = await getCurrentLocation();
      const response = await apiClient.post('/customersite/user-location/', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy
      });

      setLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: response.data
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
    apiClient.get('/barbersite/dashboard/barber/')
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

  const stats = [
    {
      label: 'Total Bookings',
      value: data?.total_bookings,
      icon: <Calendar className="w-6 h-6 text-blue-600" />
    },
    {
      label: 'Cancelled Bookings',
      value: data?.cancelled_bookings,
      icon: <Clock className="w-6 h-6 text-yellow-500" />
    },
    {
      label: 'Completed Bookings',
      value: data?.completed_bookings,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      label: 'Earnings',
      value: `₹${data?.wallet_balance?.toLocaleString() || 0}`,
      icon: <Wallet className="w-6 h-6 text-emerald-500" />
    },
    {
      label: 'Average Rating',
      value: `${(data?.average_rating || 0).toFixed(1)} ★`,
      icon: <Star className="w-6 h-6 text-yellow-400" />
    },
    {
      label: 'Total Reviews',
      value: data?.total_reviews,
      icon: <Star className="w-6 h-6 text-purple-400" />
    }
    
  ];

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
              <p className="text-yellow-800 font-medium">Location Error</p>
              <p>{locationError}</p>
              <button
                onClick={handleEnableLocation}
                className="mt-2 text-yellow-700 underline hover:text-yellow-900"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, Barber!
                </h1>
                <p className="text-gray-600 text-lg mb-2">Your performance at a glance</p>

                {location ? (
                  <div className="flex items-center gap-2 text-green-600 mt-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Location enabled - Customers can find you nearby
                    </span>
                    {location.address?.city && (
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
                      className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 transition"
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="mr-4">{stat.icon}</div>
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BarberDash;
