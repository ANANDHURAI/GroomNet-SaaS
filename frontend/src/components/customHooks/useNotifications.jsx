import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../slices/api/apiIntercepters';

export const useNotifications = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [bookingUnreadCounts, setBookingUnreadCounts] = useState({});
  const websocketRef = useRef(null);
  const isConnectedRef = useRef(false);
  const [loading, setLoading] = useState(true); 

  const fetchTotalUnreadCount = useCallback(async () => {
      try {
        setLoading(true); 
        const response = await apiClient.get('/chat-service/chat/total-unread/');
        setTotalUnreadCount(response.data.total_unread_count);
        setBookingUnreadCounts(response.data.booking_unread_counts || {});
      } catch (error) {
        console.error('Error fetching total unread count:', error);
      } finally {
        setLoading(false); 
      }
    }, []);

  const updateBookingUnreadCount = useCallback((bookingId, count) => {
    setBookingUnreadCounts(prev => {
      const newCounts = { ...prev };
      const oldCount = newCounts[bookingId] || 0;
      
      if (count === 0) {
        delete newCounts[bookingId];
      } else {
        newCounts[bookingId] = count;
      }
  
      setTotalUnreadCount(prevTotal => Math.max(0, prevTotal - oldCount + count));
      
      return newCounts;
    });
  }, []);

  const clearBookingUnreadCount = useCallback((bookingId) => {
    setBookingUnreadCounts(prev => {
      const currentCount = prev[bookingId] || 0;
      setTotalUnreadCount(total => Math.max(0, total - currentCount));
      const newCounts = { ...prev };
      delete newCounts[bookingId];
      return newCounts;
    });
  }, []);


  const connectGlobalWebSocket = useCallback(() => {
    if (isConnectedRef.current || websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `${protocol}//localhost:8000/ws/notifications/?token=${token}`;
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = () => {
      console.log('Global notification WebSocket connected');
      isConnectedRef.current = true;
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'total_unread_update':
            setTotalUnreadCount(data.total_count);
            setBookingUnreadCounts(data.booking_counts || {});
            break;
          case 'unread_count_update':
            updateBookingUnreadCount(data.booking_id, data.unread_count);
            break;
        }
      } catch (error) {
        console.error('Error parsing notification WebSocket message:', error);
      }
    };

    websocketRef.current.onclose = () => {
      console.log('Global notification WebSocket disconnected');
      isConnectedRef.current = false;
  
      setTimeout(connectGlobalWebSocket, 3000);
    };

    websocketRef.current.onerror = (error) => {
      console.error('Global notification WebSocket error:', error);
      isConnectedRef.current = false;
    };
  }, [updateBookingUnreadCount]);

  useEffect(() => {
    const handleUnreadUpdate = (event) => {
      const { bookingId, count } = event.detail;
      updateBookingUnreadCount(bookingId, count);
    };

    const handleTotalUpdate = (event) => {
      const { totalCount, bookingCounts } = event.detail;
      setTotalUnreadCount(totalCount);
      setBookingUnreadCounts(bookingCounts || {});
    };

    window.addEventListener('unreadCountUpdate', handleUnreadUpdate);
    window.addEventListener('totalUnreadUpdate', handleTotalUpdate);

    fetchTotalUnreadCount();
    connectGlobalWebSocket();

    return () => {
      window.removeEventListener('unreadCountUpdate', handleUnreadUpdate);
      window.removeEventListener('totalUnreadUpdate', handleTotalUpdate);
      
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      isConnectedRef.current = false;
    };
  }, [fetchTotalUnreadCount, updateBookingUnreadCount, connectGlobalWebSocket]);

  return {
    totalUnreadCount,
    bookingUnreadCounts,
    updateBookingUnreadCount,
    clearBookingUnreadCount,
    fetchTotalUnreadCount,
    loading
  };
};