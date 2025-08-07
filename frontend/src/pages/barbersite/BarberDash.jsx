import React, { useEffect, useState } from 'react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import apiClient from '../../slices/api/apiIntercepters';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import LocationModal from '../../components/basics/LocationModal';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import {
  MapPin, CheckCircle, Star, Calendar, Wallet, Clock, TrendingUp, Users, Briefcase, Camera, DollarSign
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

function BarberDash() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  const routeLocation = useRouterLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = routeLocation.pathname.includes('/instant-booking');

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
    { label: 'Total Bookings', value: data?.total_bookings, icon: Calendar, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: data?.completed_bookings, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
    { label: 'Cancelled', value: data?.cancelled_bookings, icon: Clock, gradient: 'from-yellow-500 to-yellow-600' },
    { label: 'Earnings', value: `₹${data?.wallet_balance?.toLocaleString() || 0}`, icon: Wallet, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Rating', value: `${(data?.average_rating || 0).toFixed(1)} ★`, icon: Star, gradient: 'from-yellow-400 to-yellow-500' },
    { label: 'Reviews', value: data?.total_reviews, icon: Users, gradient: 'from-purple-500 to-purple-600' }
  ];

  const quickActions = [
    { label: 'Start Work', icon: Briefcase, path: '/instant-booking', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Portfolio', icon: Camera, path: '/barbers-portfolio', gradient: 'from-purple-500 to-purple-600' },
    { label: 'Book Slots', icon: Calendar, path: '/barber-slot-booking', gradient: 'from-green-500 to-green-600' },
    { label: 'Earnings', icon: DollarSign, path: '/barber-earnings', gradient: 'from-emerald-500 to-emerald-600' }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-72">
        <BarberSidebar />
      </div>

      <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />

      <LocationModal
        isOpen={showLocationModal}
        onEnableLocation={handleEnableLocation}
        onDismiss={handleDismissLocation}
      />

      <main className="flex-1 p-8 ml-0">
        <div className="max-w-7xl mx-auto">
          {locationError && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-xl shadow-lg">
              <div className="flex items-center">
                <MapPin className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <p className="text-yellow-800 font-semibold">Location Error</p>
                  <p className="text-yellow-700 mt-1">{locationError}</p>
                  <button
                    onClick={handleEnableLocation}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-md"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, Barber!
                </h1>
                <p className="text-gray-600 text-lg mb-4">Your performance dashboard</p>

                {location ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <span className="text-green-800 font-semibold">Location Active</span>
                      <p className="text-green-600 text-sm">Customers can find you nearby</p>
                      {location.address?.city && (
                        <p className="text-gray-500 text-xs mt-1">
                          {location.address.city}, {location.address.state}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-amber-600" />
                      <div>
                        <span className="text-amber-800 font-semibold">Enable Location</span>
                        <p className="text-amber-600 text-sm">Get bookings from nearby customers</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLocationModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 font-medium"
                    >
                      Enable Now
                    </button>
                  </div>
                )}
              </div>

              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-blue-500 shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 ml-8">
                {data?.profile_image ? (
                  <img src={data.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transform transition-all duration-700 group-hover:scale-x-105`} style={{width: '75%'}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className={`p-6 bg-gradient-to-r ${action.gradient} text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 group`}
                >
                  <action.icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold text-lg">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BarberDash;