import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const NotificationContext = createContext();

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [bookingUnreadCounts, setBookingUnreadCounts] = useState({});
  const socketRef = useRef(null);

  const [token, setToken] = useState(sessionStorage.getItem('access_token'));
  const [barberId, setBarberId] = useState(sessionStorage.getItem('barber_id'));

  useEffect(() => {
    const interval = setInterval(() => {
        const currentToken = sessionStorage.getItem('access_token');
        const currentBarberId = sessionStorage.getItem('barber_id');
        
        if (currentToken !== token) setToken(currentToken);
        if (currentBarberId !== barberId) setBarberId(currentBarberId);
    }, 1000); 

    return () => clearInterval(interval);
  }, [token, barberId]);

  useEffect(() => {
    if (!token) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL || 'ws://127.0.0.1:8000'}/ws/notifications/?token=${token}`;

    console.log("🔌 Connecting Global Notification Socket...", wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => console.log('✅ Global Notification Socket Connected');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Global Socket Message:", data);
        
        if (data.type) {
            window.dispatchEvent(new CustomEvent(data.type, { detail: data }));
        }
        const eventMap = [
            'new_booking_request',
            'booking_accepted',
            'booking_cancelled',
            'service_request',
            'service_response',
            'travel_update',
            'booking_completed'
        ];

        if (eventMap.includes(data.type)) {
            window.dispatchEvent(new CustomEvent(data.type, { detail: data }));
        }

        if (data.type === 'unread_counts') {
            setTotalUnreadCount(data.total);
            setBookingUnreadCounts(data.booking_counts);
        }
      } catch (e) {
        console.error("Socket Error", e);
      }
    };

    ws.onclose = () => {
        console.log('❌ Global Socket Disconnected.');
        socketRef.current = null;
        
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [token, barberId]);

  const clearBookingUnreadCount = (bookingId) => {
    setBookingUnreadCounts(prev => {
        const newCounts = { ...prev };
        if (newCounts[bookingId]) {
            setTotalUnreadCount(c => Math.max(0, c - newCounts[bookingId]));
            delete newCounts[bookingId];
        }
        return newCounts;
    });
  };

  return (
    <NotificationContext.Provider value={{ totalUnreadCount, bookingUnreadCounts, clearBookingUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};