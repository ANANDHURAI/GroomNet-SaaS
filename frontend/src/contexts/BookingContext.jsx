import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [notification, setNotification] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [globalNotificationVisible, setGlobalNotificationVisible] = useState(false);
  const wsRef = useRef(null);

  const barberId = sessionStorage.getItem('barber_id');
  const token = sessionStorage.getItem('access_token');

  // Create WebSocket connection
  const createWebSocketConnection = () => {
    if (!barberId || !token) return;

    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = window.location.hostname === 'localhost'
      ? 'localhost:8000'
      : window.location.host;

    const wsUrl = `${wsScheme}://${wsHost}/ws/instant-booking/${barberId}/?token=${token}`;
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('Global WebSocket connected');
      setConnectionStatus('connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Global WebSocket message received:', data);

        switch (data.type) {
          case 'new_booking_request':
            const newBooking = {
              booking_id: data.booking_id,
              customer_name: data.customer_name,
              customer_id: data.customer_id,
              service_name: data.service,
              address: data.address,
              total_amount: data.total_amount,
              status: 'PENDING'
            };
            
            setCurrentBooking(newBooking);
            setNotification('New booking request received!');
            setGlobalNotificationVisible(true);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification('New Booking Request!', {
                body: `${data.customer_name} requested ${data.service}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
              });
            }
            break;

          case 'remove_booking':
            setCurrentBooking(prev => {
              if (prev?.booking_id === data.booking_id) {
                setNotification('Booking was accepted by another barber.');
                setGlobalNotificationVisible(false);
                return null;
              }
              return prev;
            });
            break;

          case 'heartbeat_response':
            console.log('Heartbeat response received');
            break;

          case 'error':
            console.error('WebSocket error:', data.message);
            setNotification(data.message);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('Global WebSocket error:', error);
      setConnectionStatus('error');
    };

    socket.onclose = (event) => {
      console.log('Global WebSocket closed:', event.code, event.reason);
      setConnectionStatus('disconnected');
      
      // Auto-reconnect logic
      if (event.code !== 1000 && barberId && token) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          createWebSocketConnection();
        }, 5000);
      }
    };
  };

  useEffect(() => {
    if (barberId && token) {
      createWebSocketConnection();
      
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Context unmounting');
      }
    };
  }, [barberId, token]);

  // Function to accept booking (to be called from notification)
  const acceptBookingFromNotification = async () => {
    if (!currentBooking) return;
    
    try {
      const response = await fetch(`/api/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'accept' })
      });

      if (response.ok) {
        setCurrentBooking(prev => ({ ...prev, status: 'CONFIRMED' }));
        setNotification('Booking accepted successfully!');
        setGlobalNotificationVisible(false);
        return true;
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      setNotification('Failed to accept booking. Please try again.');
      return false;
    }
    return false;
  };

  const contextValue = {
    currentBooking,
    setCurrentBooking,
    notification,
    setNotification,
    connectionStatus,
    globalNotificationVisible,
    setGlobalNotificationVisible,
    acceptBookingFromNotification,
    wsRef
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};