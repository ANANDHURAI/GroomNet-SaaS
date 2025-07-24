import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import Message from '../../components/customercompo/booking/Message';
import BookingInfo from '../../components/customercompo/booking/BookingInfo';
import TravelStatus from '../../components/customercompo/booking/TravelStatus';
import ServiceStatus from '../../components/customercompo/booking/ServiceStatus';
import ActionButtons from '../../components/customercompo/booking/ActionButtons';

function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [travelStatus, setTravelStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [serviceSocket, setServiceSocket] = useState(null);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchBookingDetails = async () => {
    try {
      const res = await apiClient.get(`/customersite/booking-details/${id}/`);
      setData(res.data);
      calculateTimeLeft(res.data.date, res.data.slottime);

      const bookingIdToUse = res.data.id || res.data.orderid;
      fetchTravelStatus(bookingIdToUse);
    } catch (err) {
      console.error("Booking fetch error", err);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  useEffect(() => {
    if (data?.booking_status === 'CONFIRMED') {
      const wsUrl = `ws://localhost:8000/ws/service/conformation/`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => setServiceSocket(socket);
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'service_request') setShowServicePopup(true);
        if (message.type === 'serivce_completed') {
          setNotification('🎉 Service completed! Thank you for choosing our service.');
        }
      };
      socket.onclose = () => setServiceSocket(null);
      socket.onerror = (error) => console.error("WebSocket error:", error);

      return () => socket.close();
    }
  }, [data]);

  const calculateTimeLeft = (date, time) => {
    if (time === "N/A") {
      setTimeLeft("No scheduled time (instant booking)");
      return;
    }
    const serviceTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = serviceTime - now;
    if (diff <= 0) return setTimeLeft("Service is active now");

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    setTimeLeft(`${hrs}h ${rem}m remaining`);
  };

  const fetchTravelStatus = async (bookingId) => {
    try {
      const res = await apiClient.get(`/customersite/booking/${bookingId}/get-travel-status/`);
      setTravelStatus(res.data);
    } catch (err) {
      console.warn("Travel status not available");
    }
  };

  const handleChatClick = () => {
    navigate(`/customer/chat/${id}`, {
      state: { bookingData: data, barberName: data.barbername }
    });
  };

  const handleCancelSuccess = () => {
    fetchBookingDetails();
    setNotification('🚫 Booking cancelled successfully. Refund has been processed to your wallet.');
  };

  return (
    <CustomerLayout>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>

      {data ? (
        <>
          <BookingInfo data={data} timeLeft={timeLeft} />

          {data.booking_status === 'CONFIRMED' && travelStatus && (
            <TravelStatus travelStatus={travelStatus} />
          )}

          {data.booking_status === 'CONFIRMED' && travelStatus?.travel_status === 'ARRIVED' && (
            <ServiceStatus />
          )}

          <ActionButtons
            bookingStatus={data.booking_status}
            onChatClick={handleChatClick}
            bookingId={id}
            travelStatus={travelStatus?.travel_status}
            onCancelSuccess={handleCancelSuccess}
          />
        </>
      ) : (
        <div className="text-gray-600">Loading booking details...</div>
      )}

      {notification && <Message message={notification} />}
    </CustomerLayout>
  );
}

export default BookingDetailsPage;