import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import CurrentBookingCard from './CurrentBookingCard';
import BookingRequestCard from './BookingRequestCard';
import StatusCard from './StatusCard';

const InstantBookingTab = ({
  isOnline,
  toggleOnlineStatus,
  loading,
  notification,
  setNotification,
  wsRef,
  navigate
}) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const ACCESS_TOKEN = sessionStorage.getItem('access_token');
  const barberId = sessionStorage.getItem('barber_id');


  const createWebSocketConnection = () => {
    if (!isOnline) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = window.location.hostname === 'localhost'
      ? 'localhost:8000'
      : window.location.host;

    const currentToken = sessionStorage.getItem('access_token');
    const currentBarberId = sessionStorage.getItem('barber_id');
    
    if (!currentToken || !currentBarberId) {
      setConnectionStatus('error');
      setNotification('Authentication error. Please login again.');
      return;
    }

    const wsUrl = `${wsScheme}://${wsHost}/ws/instant-booking/${currentBarberId}/?token=${currentToken}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    setConnectionStatus('connecting');

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected for barber notifications');
      setConnectionStatus('connected');
      setNotification('Connected successfully!');
      setReconnectAttempts(0);
      
      setTimeout(() => setNotification(''), 3000);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        switch (data.type) {
          case 'new_booking_request':
            setCurrentBooking({
              booking_id: data.booking_id,
              customer_name: data.customer_name,
              customer_id: data.customer_id,
              service_name: data.service,
              address: data.address,
              total_amount: data.total_amount,
              status: 'PENDING'
            });
            setNotification('New booking request received!');
            break;

          case 'remove_booking':
            setCurrentBooking(prev => {
              if (prev?.booking_id === data.booking_id) {
                setNotification('Booking was accepted by another barber.');
                return null;
              }
              return prev;
            });
            break;

          case 'heartbeat_response':
            console.log('Heartbeat response received');
            break;

          case 'error':
            console.error('WebSocket error message:', data.message);
            setNotification(data.message);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionStatus('disconnected');

      if (event.code === 4001) {
        setNotification('Authentication failed. Please login again.');
        return;
      } else if (event.code === 4002) {
        setNotification('Cannot connect: You have active bookings.');
        return;
      } else if (event.code === 1000) {
      
        return;
      }
    };
  };

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
        setCurrentBooking(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching active bookings:', err);
      if (err.response?.status === 401) {
        setNotification('Session expired. Please login again.');
      }
      return null;
    }
  }, [barberId]);

  useEffect(() => {
    if (!isOnline || !barberId) {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Going offline');
      }
      setConnectionStatus('offline');
      return;
    }

    let isMounted = true; 

    const initializeConnection = async () => {
      try {
        const response = await apiClient.get(
          `/instant-booking/active-booking/${barberId}`
        );
        
        if (!isMounted) return;
        
        const hasActiveBooking = response.data.active_instant_booking;
        
        if (hasActiveBooking) {
          console.log('Barber has active booking, skipping WebSocket connection');
          setCurrentBooking({
            ...response.data.active_instant_booking,
            status: 'CONFIRMED'
          });
          setConnectionStatus('blocked');
          return;
        }

        setCurrentBooking(null);
        createWebSocketConnection();
        
      } catch (error) {
        if (!isMounted) return;
        console.error('Error checking active bookings:', error);
        createWebSocketConnection();
      }
    };

    initializeConnection();

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [isOnline, barberId]); 

 

  const handleAcceptBooking = async () => {
    try {
      setIsLoadingAction(true);
      const response = await apiClient.post(
        `/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`,
        { action: 'accept' }
      );

      if (response.data.status === 'success') {
        setCurrentBooking(prev => ({ ...prev, status: 'CONFIRMED' }));
        setNotification('Booking accepted successfully!');
        navigate(`/travel-status/${currentBooking.booking_id}`);
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
    try {
      setIsLoadingAction(true);
      const response = await apiClient.post(
        `/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`,
        { action: 'reject' }
      );

      if (response.data.status === 'success') {
        setCurrentBooking(null);
        setNotification('Booking rejected successfully');
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