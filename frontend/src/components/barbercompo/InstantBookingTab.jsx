import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { CurrentBookingCard } from './CurrentBookingCard';
import { BookingRequestCard } from './BookingRequestCard';
import StatusCard from './StatusCard';
import { useBooking } from '../../contexts/BookingContext';

const InstantBookingTab = ({
  isOnline,
  toggleOnlineStatus,
  loading,
  navigate
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

  return (
    <>
      <StatusCard isOnline={isOnline} toggleOnlineStatus={toggleOnlineStatus} loading={loading} />
      
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

      {!currentBooking && isOnline && (
        <div className="text-center mt-6 text-gray-600">Waiting for new bookings...</div>
      )}

      {!isOnline && (
        <div className="text-center mt-6 text-gray-600">You are currently offline.</div>
      )}
    </>
  );
};

export default InstantBookingTab;