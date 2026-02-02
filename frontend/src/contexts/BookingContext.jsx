import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [notification, setNotification] = useState('');
  const [globalNotificationVisible, setGlobalNotificationVisible] = useState(false);

  const barberId = sessionStorage.getItem('barber_id');
  const token = sessionStorage.getItem('access_token');

  useEffect(() => {
  
    const handleIncomingBooking = (event) => {
      const data = event.detail;
      
    
      setCurrentBooking({
        booking_id: data.booking_id,
        customer_name: data.customer_name,
        service_name: data.service, 
        address: data.address,
        total_amount: data.total_amount,
        status: 'PENDING' 
      });
      
      setNotification('New booking request received!');
      setGlobalNotificationVisible(true);
    };

    const handleCompletedBooking = (event) => {
        
        setCurrentBooking(null);
        setGlobalNotificationVisible(false);
        setNotification('');
    };

   
    window.addEventListener('new_booking_request', handleIncomingBooking);
    window.addEventListener('booking_completed', handleCompletedBooking); 

    return () => {
      window.removeEventListener('new_booking_request', handleIncomingBooking);
      window.removeEventListener('booking_completed', handleCompletedBooking);
    };
  }, []);

  const acceptBookingFromNotification = async () => {
    if (!currentBooking || !barberId) return false;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/instant-booking/barber-action/${barberId}/${currentBooking.booking_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'accept' })
      });

      if (response.ok) {
        setCurrentBooking(prev => ({ ...prev, status: 'CONFIRMED' }));
        setGlobalNotificationVisible(false);
        return true;
      }
    } catch (error) {
      console.error('Accept Booking Error:', error);
    }
    return false;
  };

  const contextValue = {
    currentBooking,
    setCurrentBooking,
    notification,
    setNotification,
    globalNotificationVisible,
    setGlobalNotificationVisible,
    acceptBookingFromNotification,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};