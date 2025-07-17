import React, { useState, useEffect } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import CurrentBookingCard from './CurrentBookingCard';
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
  const ACCESS_TOKEN = sessionStorage.getItem('access_token');
  const barberId = sessionStorage.getItem('barber_id');

  useEffect(() => {
    if (!isOnline) return;

    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = window.location.hostname === 'localhost'
      ? 'localhost:8000'
      : window.location.host;

    const notificationWsUrl = `${wsScheme}://${wsHost}/ws/instant-booking/0/?token=${ACCESS_TOKEN}`;

    console.log('Connecting to barber notification WebSocket:', notificationWsUrl);

    wsRef.current = new WebSocket(notificationWsUrl);

    wsRef.current.onopen = () => {
      console.log('Notification WebSocket connected for barber.');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Notification WebSocket message:', data);

      if (data.type === 'new_booking_request') {
        console.log('✅ New booking assigned:', data);

        setCurrentBooking({
          booking_id: data.booking_id,
          customer_name: data.customer_name,
          address: data.address,
          service: data.service,
          total_amount: data.total_amount
        });

        setNotification('📢 You have a new booking!');

        // 🔥 Now connect to booking-specific WebSocket
        const bookingWsUrl = `${wsScheme}://${wsHost}/ws/instant-booking/${data.booking_id}/?token=${ACCESS_TOKEN}`;
        console.log('Connecting to booking WebSocket:', bookingWsUrl);

        const bookingSocket = new WebSocket(bookingWsUrl);

        bookingSocket.onopen = () => {
          console.log('Booking WebSocket connected for updates.');
        };

        bookingSocket.onmessage = (bookingEvent) => {
          const bookingData = JSON.parse(bookingEvent.data);
          console.log('Booking WebSocket message:', bookingData);

          if (bookingData.service_completed) {
            setNotification('✅ Service completed. Ready for new bookings!');
            setCurrentBooking(null);
            bookingSocket.close();
          }
        };

        bookingSocket.onclose = () => {
          console.log('Booking WebSocket closed.');
        };

        bookingSocket.onerror = (err) => {
          console.error('Booking WebSocket error:', err);
        };
      }
    };

    wsRef.current.onclose = () => {
      console.log('Notification WebSocket disconnected.');
    };

    wsRef.current.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
      setNotification('⚠️ Connection error. Trying to reconnect...');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [isOnline, ACCESS_TOKEN, barberId, wsRef]);

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

      {currentBooking && (
        <CurrentBookingCard
          booking={currentBooking}
          navigate={navigate}
        />
      )}

      {!currentBooking && isOnline && (
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
