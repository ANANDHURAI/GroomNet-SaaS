import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import Message from '../../components/customercompo/booking/Message';
import BookingInfo from '../../components/customercompo/booking/BookingInfo';
import TravelStatus from '../../components/customercompo/booking/TravelStatus';
import ActionButtons from '../../components/customercompo/booking/ActionButtons';
import RatingModal from '../../components/customercompo/booking/RatingModal';
import ComplaintModal from '../../components/customercompo/booking/ComplaintModal';
import ComplaintStatus from '../../components/customercompo/booking/ComplaintStatus';


function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    data: null,
    travelStatus: null,
    timeLeft: '',
    notification: '',
    showRatingModal: false,
    showComplaintModal: false,
    hasRated: false,
    hasComplaint: false
  });

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const fetchBookingDetails = async () => {
    try {
      const res = await apiClient.get(`/customersite/booking-details/${id}/`);
      const bookingData = res.data;
      
      updateState({ data: bookingData });
      calculateTimeLeft(bookingData.date, bookingData.slottime);

      const bookingId = bookingData.id || bookingData.orderid || id;
      if (bookingId) {
        await Promise.all([
          fetchTravelStatus(bookingId),
          bookingData.booking_status === 'COMPLETED' ? checkExistingRating(bookingId) : Promise.resolve(),
          bookingData.booking_status === 'COMPLETED' ? checkExistingComplaint(bookingId) : Promise.resolve()
        ]);
      }
    } catch (err) {
      console.error("Booking fetch error", err);
    }
  };

  const fetchTravelStatus = async (bookingId) => {
    try {
      const res = await apiClient.get(`/customersite/booking/${bookingId}/get-travel-status/`);
      updateState({ travelStatus: res.data });
    } catch (err) {
      console.warn("Travel status not available");
    }
  };

  const checkExistingRating = async (bookingId) => {
    try {
      const res = await apiClient.get(`/customersite/ratings/?booking=${bookingId}`);
      const hasExistingRating = res.data && res.data.length > 0;
      updateState({ hasRated: hasExistingRating });
    } catch (err) {
      console.warn("Could not check existing ratings", err);
      updateState({ hasRated: false });
    }
  };

  const checkExistingComplaint = async (bookingId) => {
    try {
      const res = await apiClient.get(`/customersite/complaints/?booking=${bookingId}`);
      const hasExistingComplaint = res.data && res.data.length > 0;
      updateState({ hasComplaint: hasExistingComplaint });
    } catch (err) {
      console.warn("Could not check existing complaints", err);
      updateState({ hasComplaint: false });
    }
  };

  const calculateTimeLeft = (date, time) => {
    if (time === "N/A") {
      updateState({ timeLeft: "No scheduled time (instant booking)" });
      return;
    }
    
    const serviceTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = serviceTime - now;
    
    if (diff <= 0) {
      updateState({ timeLeft: "Service is active now" });
      return;
    }

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    updateState({ timeLeft: `${hrs}h ${rem}m remaining` });
  };

  const handleChatClick = () => {
    navigate(`/customer/chat/${id}`, {
      state: { bookingData: state.data, barberName: state.data.barbername }
    });
  };

  const handleCancelSuccess = () => {
    fetchBookingDetails();
    updateState({ 
      notification: 'Booking cancelled successfully. Refund has been processed to your wallet.' 
    });
  };

  const handleRatingSuccess = () => {
    updateState({ 
      showRatingModal: false,
      hasRated: true,
      notification: 'Thank you for your rating! Your feedback helps us improve our service.'
    });
  };

  const handleComplaintSuccess = () => {
    updateState({ 
      showComplaintModal: false,
      hasComplaint: true,
      notification: 'Your complaint has been submitted successfully. We will review it and get back to you soon.'
    });
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const { data, travelStatus, timeLeft, notification, showRatingModal, showComplaintModal, hasRated, hasComplaint } = state;

  return (
    <CustomerLayout>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>

      {data ? (
        <>
          <BookingInfo data={data} timeLeft={timeLeft} />

          {data.booking_status === 'CONFIRMED' && travelStatus && (
            <TravelStatus travelStatus={travelStatus} />
          )}

          <ActionButtons
            bookingStatus={data.booking_status}
            onChatClick={handleChatClick}
            bookingId={id}
            travelStatus={travelStatus?.travel_status}
            onCancelSuccess={handleCancelSuccess}
            onRatingClick={() => updateState({ showRatingModal: true })}
            hasRated={hasRated}
            onComplaintClick={() => updateState({ showComplaintModal: true })}
            hasComplaint={hasComplaint}
          />

          
        </>
      ) : (
        <div className="text-gray-600">Loading booking details...</div>
      )}

      {notification && <Message message={notification} />}

      {showRatingModal && (
        <RatingModal
          bookingId={data?.id || data?.orderid || id}
          onClose={() => updateState({ showRatingModal: false })}
          onSuccess={handleRatingSuccess}
        />
      )}

      {showComplaintModal && (
        <ComplaintModal
          bookingId={data?.id || data?.orderid || id}
          onClose={() => updateState({ showComplaintModal: false })}
          onSuccess={handleComplaintSuccess}
        />
      )}
    </CustomerLayout>
  );
}

export default BookingDetailsPage;