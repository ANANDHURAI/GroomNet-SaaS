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
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => console.log('Notification Socket Connected');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type) {
            window.dispatchEvent(new CustomEvent(data.type, { detail: data }));
        }

        if (data.type === 'notification_update' && data.update_type === 'total_unread_update') {
            let newTotal = data.total_count;
            let newBookingCounts = data.booking_counts;

            const currentPath = window.location.pathname;
            const match = currentPath.match(/chat\/(\d+)/); 
            
            if (match) {
                const currentOpenBookingId = match[1];
                
                if (newBookingCounts[currentOpenBookingId]) {
                    newTotal = Math.max(0, newTotal - newBookingCounts[currentOpenBookingId]);
                  
                }
            }

            setTotalUnreadCount(newTotal);
            setBookingUnreadCounts(newBookingCounts);
        }

      } catch (e) {
        console.error("Socket Message Error", e);
      }
    };

    ws.onclose = () => {
        console.log('Notification Socket Disconnected');
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