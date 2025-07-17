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
        setIsOnline(response.data.is_online || false); 
        setHasActiveBooking(response.data.has_active_booking || false); 
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
        setNotification('You have a booking. Complete it before going offline.');
        return;
      }

      const action = isOnline ? 'offline' : 'online';
      const response = await apiClient.post(`/instant-booking/working/status/${barberId}/`, {
        action: action,
      });

      setIsOnline(!isOnline);
      setNotification(response.data.message || 'Status updated.');
    } catch (err) {
      console.error('Error updating barber status:', err);
      setNotification(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:block w-64 border-r bg-white">
        <BarberSidebar />
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`py-2 px-4 font-semibold text-base ${activeTab === 'instant' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('instant')}
            >
              Instant Booking
            </button>
            <button
              className={`py-2 px-4 font-semibold text-base ${activeTab === 'scheduled' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('scheduled')}
            >
              <NotificationIndicator />
              Scheduled Booking
            </button>
          </div>

          {/* Online/Offline toggle */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Power
                  onClick={toggleOnlineStatus}
                  className={`w-5 h-5 cursor-pointer ${
                    isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isOnline ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              {loading && <span className="text-xs text-gray-400">Updating...</span>}
            </div>
            {notification && (
              <div className="mt-2 text-sm text-red-500">{notification}</div>
            )}
          </div>

          {/* Tabs content */}
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
    </div>
  );
};

export default WorkingArea;
