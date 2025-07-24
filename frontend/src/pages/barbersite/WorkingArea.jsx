import React, { useState, useEffect, useRef } from 'react';
import { Power } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import { useNavigate } from 'react-router-dom';
import InstantBookingTab from '../../components/barbercompo/InstantBookingTab';
import ScheduledBookingTab from '../../components/barbercompo/ScheduledBookingTab';
import NotificationIndicator from '../../components/mini ui/NotificationIndicater';

const WorkingArea = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [hasActiveBooking, setHasActiveBooking] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('instant');
  const wsRef = useRef(null);
  const navigate = useNavigate();

  const barberId = sessionStorage.getItem('barber_id');

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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <BarberSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-gray-300">
            <button
              className={`py-2 px-4 font-medium text-sm md:text-base ${
                activeTab === 'instant'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('instant')}
            >
              Instant Booking
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm md:text-base relative ${
                activeTab === 'scheduled'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('scheduled')}
            >
              <NotificationIndicator />
              Scheduled Booking
            </button>
          </div>

          {/* Online Status Toggle */}
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

          {/* Notifications */}
          {notification && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{notification}</p>
            </div>
          )}

          {/* Tab Content */}
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
