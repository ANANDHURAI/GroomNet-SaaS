import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { CurrentBookingCard } from './CurrentBookingCard';
import { BookingRequestCard } from './BookingRequestCard';
import { useBooking } from '../../contexts/BookingContext';
import { Power, CalendarClock, AlertTriangle } from 'lucide-react'; 

const InstantBookingTab = ({
  isOnline,
  toggleOnlineStatus,
  loading,
  navigate,
  nextBookingTime 
}) => {
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const {
    currentBooking,
    setCurrentBooking,
    notification,
    setNotification
  } = useBooking();

  const barberId = sessionStorage.getItem('barber_id');

  const fetchActiveBookings = useCallback(async () => {
    if (!barberId) return;

    try {
      const response = await apiClient.get(`/instant-booking/active-booking/${barberId}`);
      const activeBooking = response.data.active_instant_booking;
      
      if (activeBooking) {
        setCurrentBooking({ ...activeBooking, status: 'CONFIRMED' });
      } else {
        setCurrentBooking(prev => {
            if (prev?.status === 'PENDING') {
                return prev; 
            }
            return null;
        });
      }
    } catch (err) {
      console.error('Error fetching active bookings:', err);
    }
  }, [barberId, setCurrentBooking]);

  useEffect(() => {
      const interval = setInterval(() => {
          if (isOnline) fetchActiveBookings();
      }, 5000); 
      return () => clearInterval(interval);
  }, [isOnline, fetchActiveBookings]);

  useEffect(() => {
    if(barberId) fetchActiveBookings();
  }, [barberId, fetchActiveBookings]);

  const handleAcceptBooking = async () => {
    if (!currentBooking) return;
    try {
      setIsLoadingAction(true);
      const response = await apiClient.post(
        `/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`,
        { action: 'accept' }
      );
      if (response.data.status === 'success') {
        setCurrentBooking(prev => ({ ...prev, status: 'CONFIRMED' }));
        setNotification('Booking accepted!');
      }
    } catch (error) {
      setNotification('Failed to accept.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!currentBooking) return;
    try {
      setIsLoadingAction(true);
      await apiClient.post(
        `/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`,
        { action: 'reject' }
      );
      setCurrentBooking(null);
      setNotification('Booking rejected.');
    } catch (error) {
      setNotification('Failed to reject.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const formatTime = (isoString) => {
    if(!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6">
      
      <div className={`rounded-2xl p-6 mb-8 transition-all duration-300 border ${
        nextBookingTime 
          ? 'bg-amber-50 border-amber-200' 
          : isOnline 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'   
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
           
              <div className={`w-3 h-3 rounded-full ${
                nextBookingTime ? 'bg-amber-500' : isOnline ? 'bg-green-500' : 'bg-gray-400'
              } ${isOnline && !nextBookingTime ? 'animate-pulse' : ''}`}></div>
              
              <h2 className={`text-xl font-bold ${
                nextBookingTime ? 'text-amber-800' : isOnline ? 'text-green-800' : 'text-gray-700'
              }`}>
                {nextBookingTime 
                  ? "Instant Booking Unavailable" 
                  : isOnline 
                    ? "You are Online" 
                    : "You are Offline"}
              </h2>
            </div>
            
            <p className={`text-sm ${
              nextBookingTime ? 'text-amber-700' : isOnline ? 'text-green-600' : 'text-gray-500'
            }`}>
              {nextBookingTime 
                ? "Scheduled booking approaching. Work mode disabled."
                : isOnline 
                  ? "Customers can see you and request bookings." 
                  : "Go online to start receiving instant booking requests."}
            </p>
          </div>

          {nextBookingTime ? (
             <div className="flex flex-col items-end">
                <div className="bg-amber-200 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm">
                    <CalendarClock size={20} />
                    <span>Locked</span>
                </div>
             </div>
          ) : (
            <button
              onClick={toggleOnlineStatus}
              disabled={loading}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-sm ${
                isOnline 
                  ? 'bg-green-500 focus:ring-green-300' 
                  : 'bg-gray-300 focus:ring-gray-200'
              }`}
            >
              <span
                className={`${
                  isOnline ? 'translate-x-13' : 'translate-x-1'
                } inline-block h-10 w-10 transform rounded-full bg-white transition-transform duration-300 shadow-md flex items-center justify-center`}
                style={{ transform: isOnline ? 'translateX(50px)' : 'translateX(4px)' }}
              >
                <Power size={20} className={isOnline ? 'text-green-500' : 'text-gray-400'} />
              </span>
            </button>
          )}
        </div>

        {nextBookingTime && (
            <div className="mt-6 bg-white bg-opacity-60 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                    <AlertTriangle className="text-amber-600 w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900 text-lg">Upcoming Schedule Alert</h4>
                    <p className="text-amber-800 mt-1 leading-relaxed">
                        Your upcoming scheduled booking is at <span className="font-black bg-amber-200 px-2 py-0.5 rounded text-amber-900">{formatTime(nextBookingTime)}</span>. 
                        <br/>
                        Please be ready with all necessary equipment. 
                        <span className="block text-sm mt-2 opacity-80 font-medium italic">
                            *Instant bookings are disabled until this service is completed to ensure punctuality.
                        </span>
                    </p>
                </div>
            </div>
        )}
      </div>
      
      
      {notification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-blue-800">{notification}</div>
      )}

      {currentBooking?.status === 'PENDING' && (
        <BookingRequestCard
          booking={currentBooking}
          onAccept={handleAcceptBooking}
          onReject={handleRejectBooking}
          loading={isLoadingAction}
        />
      )}

      {currentBooking?.status === 'CONFIRMED' && (
        <CurrentBookingCard booking={currentBooking} navigate={navigate} />
      )}

      {!currentBooking && isOnline && !nextBookingTime && (
        <div className="text-center mt-12 mb-12">
            <div className="inline-block p-6 rounded-full bg-blue-50 mb-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-medium text-gray-800">Waiting for customers...</h3>
            <p className="text-gray-500 mt-2">Keep this screen open to receive requests.</p>
        </div>
      )}

      {!isOnline && !nextBookingTime && (
        <div className="text-center mt-12 text-gray-500 italic">
            You are currently offline. Go online to start working.
        </div>
      )}
    </div>
  );
};

export default InstantBookingTab;