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
    setNotification,
    connectionStatus
  } = useBooking();

  const barberId = sessionStorage.getItem('barber_id');

  const fetchActiveBookings = useCallback(async () => {
    if (!barberId) return null;

    try {
      const response = await apiClient.get(
        `/instant-booking/active-booking/${barberId}`
      );
      console.log("Active booking data:", response.data.active_instant_booking);
      
      const activeBooking = response.data.active_instant_booking;
      if (activeBooking) {
        setCurrentBooking({
          ...activeBooking,
          status: 'CONFIRMED'
        });
        return activeBooking;
      } else {
        // Only set to null if there's no pending booking from global context
        if (currentBooking?.status !== 'PENDING') {
          setCurrentBooking(null);
        }
        return null;
      }
    } catch (err) {
      console.error('Error fetching active bookings:', err);
      if (err.response?.status === 401) {
        setNotification('Session expired. Please login again.');
      }
      return null;
    }
  }, [barberId, setCurrentBooking, setNotification, currentBooking]);

  useEffect(() => {
    // Fetch active bookings when component mounts
    if (isOnline && barberId) {
      fetchActiveBookings();
    }
  }, [isOnline, barberId, fetchActiveBookings]);

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
        setNotification('Booking accepted successfully!');
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      setNotification(
        error.response?.data?.error || 
        'Failed to accept booking. Please try again.'
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!currentBooking) return;
    
    try {
      setIsLoadingAction(true);
      const response = await apiClient.post(
        `/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`,
        { action: 'reject' }
      );

      if (response.data.status === 'success') {
        setCurrentBooking(null);
        setNotification('Booking rejected successfully');
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setNotification(
        error.response?.data?.error || 
        'Failed to reject booking. Please try again.'
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <>
      <StatusCard
        isOnline={isOnline}
        toggleOnlineStatus={toggleOnlineStatus}
        loading={loading}
      />
      
      {notification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">{notification}</p>
        </div>
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
        <CurrentBookingCard
          booking={currentBooking}
          navigate={navigate}
        />
      )}

      {!currentBooking && isOnline && connectionStatus === 'connected' && (
        <div className="text-center mt-6">
          <p className="text-gray-600">⏳ Waiting for new bookings...</p>
        </div>
      )}

      {!isOnline && (
        <div className="text-center mt-6">
          <p className="text-gray-600">🛑 You are currently offline.</p>
        </div>
      )}
    </>
  );
};

export default InstantBookingTab;