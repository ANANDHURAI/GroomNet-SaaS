import React, { useState, useEffect, useRef } from 'react';
import { Power } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import InstantBookingTab from '../../components/barbercompo/InstantBookingTab';
import ScheduledBookingTab from '../../components/barbercompo/ScheduledBookingTab';
import NotificationIndicator from '../../components/mini ui/NotificationIndicater';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useBooking } from '../../contexts/BookingContext';

const WorkingArea = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('instant');
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get booking context
  const { 
    currentBooking, 
    notification: globalNotification, 
    setNotification: setGlobalNotification 
  } = useBooking();

  const barberId = sessionStorage.getItem('barber_id');

  // Check if we should show notifications
  // Show notifications ONLY when on scheduled booking tab, not on instant booking tab
  const shouldShowNotification = activeTab === 'scheduled';

  useEffect(() => {
    if (!barberId) {
      console.error('No barber_id found in sessionStorage!');
      navigate('/barber/login');
      return;
    }

    const fetchBarberStatus = async () => {
      try {
        const response = await apiClient.get(`/instant-booking/working/status/${barberId}`);
        setIsOnline(response.data.is_online);
        setHasActiveBooking(
          response.data.has_active_instant_booking ||
          response.data.has_upcoming_scheduled_booking
        );
      } catch (err) {
        console.error('Error fetching barber status:', err);
      }
    };

    fetchBarberStatus();
  }, [barberId, navigate]);

  const toggleOnlineStatus = async () => {
    if (!barberId) {
      setNotification('Barber ID not found. Please login again.');
      navigate('/barber/login');
      return;
    }

    try {
      setLoading(true);

      if (isOnline && hasActiveBooking) {
        setNotification('Complete your active booking before going offline.');
        return;
      }

      const action = isOnline ? 'offline' : 'online';
      const response = await apiClient.post(
        `/instant-booking/working/status/${barberId}/`,
        { action }
      );

      setIsOnline(!isOnline);
      setNotification(response.data.message);
    } catch (err) {
      console.error('Error updating barber status:', err);
      setNotification(
        err.response?.data?.message ||
        'Failed to update status. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleGoToInstantBooking = () => {
    setActiveTab('instant');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Show Global Notification only when on scheduled tab and there's a pending booking */}
      {shouldShowNotification && currentBooking?.status === 'PENDING' && (
        <GlobalBookingNotifier
          currentBooking={currentBooking}
          notification={globalNotification}
          setNotification={setGlobalNotification}
          navigate={navigate}
          location={location}
          isOnWorkingAreaPage={false} // Set to false so notification shows
          onAccept={handleGoToInstantBooking} // Switch to instant booking tab
          onViewDetails={handleGoToInstantBooking} // Switch to instant booking tab
        />
      )}

      <div className="w-full md:w-64 flex-shrink-0">
        <BarberSidebar />
      </div>
      
      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-gray-300">
            <button
              className={`py-2 px-4 font-medium text-sm md:text-base ${
                activeTab === 'instant'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('instant')}
            >
              Instant Booking
              {/* Show notification badge on instant booking tab if there's a pending booking */}
              {currentBooking?.status === 'PENDING' && activeTab !== 'instant' && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                  !
                </span>
              )}
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm md:text-base relative ${
                activeTab === 'scheduled'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('scheduled')}
            >
              <NotificationIndicator />
              Scheduled Booking
            </button>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Power
                onClick={toggleOnlineStatus}
                className={`w-6 h-6 cursor-pointer ${
                  isOnline ? "text-green-500" : "text-gray-400"
                }`}
              />
              <span className={`font-medium ${
                isOnline ? "text-green-600" : "text-gray-500"
              }`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            {loading && <span className="text-xs text-gray-400">Updating...</span>}
          </div>

          {/* Local notifications */}
          {notification && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{notification}</p>
            </div>
          )}

          {/* Show instant booking notification banner on scheduled tab */}
          {activeTab === 'scheduled' && currentBooking?.status === 'PENDING' && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-lg border border-orange-300 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    🚨 New Instant Booking Request!
                  </h4>
                  <p className="text-sm opacity-90 mt-1">
                    <strong>{currentBooking.customer_name}</strong> requested <strong>{currentBooking.service_name}</strong> for ₹{currentBooking.total_amount}
                  </p>
                </div>
                <button
                  onClick={handleGoToInstantBooking}
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow"
                >
                  Switch to Accept
                </button>
              </div>
            </div>
          )}

          <div>
            {activeTab === 'instant' ? (
              <InstantBookingTab
                isOnline={isOnline}
                toggleOnlineStatus={toggleOnlineStatus}
                loading={loading}
                notification={notification}
                setNotification={setNotification}
                wsRef={wsRef}
                navigate={navigate}
              />
            ) : (
              <ScheduledBookingTab />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkingArea;