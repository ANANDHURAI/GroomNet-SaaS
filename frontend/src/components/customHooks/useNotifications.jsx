import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../slices/api/apiIntercepters';

export const useNotifications = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [bookingUnreadCounts, setBookingUnreadCounts] = useState({});
  const websocketConnections = useRef(new Set());

  const fetchTotalUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat-service/chat/total-unread/');
      setTotalUnreadCount(response.data.total_unread_count);
      setBookingUnreadCounts(response.data.booking_unread_counts || {});
    } catch (error) {
      console.error('Error fetching total unread count:', error);
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
    
    const pollInterval = setInterval(fetchTotalUnreadCount, 30000);

    return () => {
      window.removeEventListener('unreadCountUpdate', handleUnreadUpdate);
      window.removeEventListener('totalUnreadUpdate', handleTotalUpdate);
      clearInterval(pollInterval);
    };
  }, [fetchTotalUnreadCount, updateBookingUnreadCount]);

  return {
    totalUnreadCount,
    bookingUnreadCounts,
    updateBookingUnreadCount,
    clearBookingUnreadCount,
    fetchTotalUnreadCount
  };
};