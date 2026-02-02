import React, { useState, useEffect, useRef } from 'react';
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
  const [nextBookingTime, setNextBookingTime] = useState(null); 

  const wsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    currentBooking, 
    notification: globalNotification, 
    setNotification: setGlobalNotification 
  } = useBooking();

  const barberId = sessionStorage.getItem('barber_id');
  const showGlobalNotifier = currentBooking?.status === 'PENDING' && activeTab !== 'instant';

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
        setHasActiveBooking(response.data.has_active_instant_booking);

        if (response.data.has_upcoming_scheduled_booking) {
            setNextBookingTime(response.data.next_booking_time);
            
            if (response.data.is_online) {
               setIsOnline(false); 
            }
        } else {
            setNextBookingTime(null);
        }

      } catch (err) {
        console.error('Error fetching barber status:', err);
      }
    };

    fetchBarberStatus();

    const interval = setInterval(fetchBarberStatus, 60000);
    return () => clearInterval(interval);

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
      
      const errorResponse = err.response?.data;
      const errorCode = errorResponse?.error_code;
      const errorMessage = errorResponse?.message || 'Failed to update status. Please try again.';

      setNotification(errorMessage);

      if (err.response?.status === 403) {
          if (errorCode === 'NO_SERVICES') {
              setTimeout(() => {
                  setNotification("Redirecting to Services page...");
                  navigate('/barber/my-services');
              }, 2000);
          } 
          else if (errorCode === 'NO_PORTFOLIO' || errorCode === 'INCOMPLETE_PORTFOLIO') {
              setTimeout(() => {
                  setNotification("Redirecting to Portfolio page...");
                  navigate('/barbers-portfolio');
              }, 2000);
          }
      }

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {showGlobalNotifier && (
        <GlobalBookingNotifier
          currentBooking={currentBooking}
          notification={globalNotification}
          setNotification={setGlobalNotification}
          navigate={navigate}
          location={location}
          isOnWorkingAreaPage={false}
          onAccept={handleGoToInstantBooking} 
          onViewDetails={handleGoToInstantBooking} 
        />
      )}

      <div className="w-full lg:w-80 bg-white shadow-lg">
        <BarberSidebar />
      </div>
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <h1 className="text-2xl font-bold text-white">Manage your Bookings</h1>
            </div>
            
            <div className="flex bg-slate-50">
              <button
                className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-200 relative ${
                  activeTab === 'instant'
                    ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                onClick={() => handleTabChange('instant')}
              >
                <span>Instant Booking</span>
                
                {currentBooking?.status === 'PENDING' && activeTab !== 'instant' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </button>
              
              <button
                className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-200 relative ${
                  activeTab === 'scheduled'
                    ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                onClick={() => handleTabChange('scheduled')}
              >
                <NotificationIndicator />
                <span>Scheduled Booking</span>
              </button>
            </div>
          </div>

          {notification && (
            <div className="bg-blue-50 text-white p-4 rounded-xl shadow-lg mb-6 border-l-4 border-blue-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                <p className="font-medium text-blue-900">{notification}</p>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && currentBooking?.status === 'PENDING' && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-6 rounded-2xl shadow-xl mb-6 border border-orange-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                    <h4 className="font-bold text-lg">New Instant Booking Request!</h4>
                  </div>
                  <p className="text-orange-100 text-sm leading-relaxed">
                    <span className="font-semibold">{currentBooking.customer_name}</span> requested{' '}
                    <span className="font-semibold">{currentBooking.service_name}</span> for{' '}
                    <span className="font-bold">₹{currentBooking.total_amount}</span>
                  </p>
                </div>
                <button
                  onClick={handleGoToInstantBooking}
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Switch to Accept
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {activeTab === 'instant' ? (
              <InstantBookingTab
                isOnline={isOnline}
                toggleOnlineStatus={toggleOnlineStatus}
                loading={loading}
                notification={notification}
                setNotification={setNotification}
                wsRef={wsRef}
                navigate={navigate}
               
                nextBookingTime={nextBookingTime} 
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