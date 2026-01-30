import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import BookingInfo from '../../components/customercompo/booking/BookingInfo';
import TravelStatus from '../../components/customercompo/booking/TravelStatus';
import RatingModal from '../../components/customercompo/booking/RatingModal';
import ComplaintModal from '../../components/customercompo/booking/ComplaintModal';
import NotificationBadge from '../../components/notification/NotificationBadge';
import { useNotificationContext } from '../../contexts/NotificationContext'; 

function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookingUnreadCounts, totalUnreadCount, clearBookingUnreadCount } = useNotificationContext();
  
  const [data, setData] = useState(null);
  const [travelStatus, setTravelStatus] = useState(null);
  
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  useEffect(() => {
      fetchBookingDetails();

      const handleServiceRequest = (event) => {
        const msg = event.detail;
        if (msg.booking_id == id) {
            if (msg.subtype === "start_request") setShowStartModal(true);
            if (msg.subtype === "complete_request") setShowCompleteModal(true);
        }
      };

      const handleTravelUpdate = (event) => {
        const msg = event.detail;
        if (msg.booking_id == id) {
            setTravelStatus({ travel_status: msg.travel_status });
        }
      };

      window.addEventListener("service_request", handleServiceRequest);
      window.addEventListener("travel_update", handleTravelUpdate);
      
      return () => {
        window.removeEventListener("service_request", handleServiceRequest);
        window.removeEventListener("travel_update", handleTravelUpdate);
      };
    }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const res = await apiClient.get(`/customersite/booking-details/${id}/`);
      setData(res.data);
      if (res.data.booking_status === 'CONFIRMED') {
         const tRes = await apiClient.get(`/customersite/booking/${res.data.orderid || id}/get-travel-status/`);
         setTravelStatus(tRes.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleChatClick = () => {
    if (typeof clearBookingUnreadCount === 'function') clearBookingUnreadCount(id); 
    navigate(`/customer/chat/${id}`, { state: { bookingData: data, barberName: data.barbername } });
  };

  const sendResponse = async (action, responseVal) => {
    try {
        await apiClient.post(`/instant-booking/complete/service/${id}/`, { 
            action: action, 
            response: responseVal 
        });
        setShowStartModal(false);
        setShowCompleteModal(false);
    } catch(e) { console.error(e); }
  };

  const handleRatingSuccess = () => {
    setShowRatingModal(false);
    fetchBookingDetails(); 
  };

  const handleComplaintSuccess = () => {
    setShowComplaintModal(false);
    fetchBookingDetails(); 
  };

  return (
    <CustomerLayout>
      <NotificationBadge count={totalUnreadCount} />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>

      {showStartModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Barber is Ready!</h3>
                <p className="text-gray-600 mb-6">The barber has arrived and wants to start the service.</p>
                <div className="flex gap-3">
                    <button onClick={() => sendResponse('respond_start', 'wait')} className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Wait 2 Min</button>
                    <button onClick={() => sendResponse('respond_start', 'ready')} className="flex-1 py-3 bg-blue-600 rounded-xl font-semibold text-white hover:bg-blue-700">I'm Ready</button>
                </div>
            </div>
        </div>
      )}

    
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Service Completed?</h3>
                <p className="text-gray-600 mb-6">The barber has marked the service as done.</p>
                <div className="flex gap-3">
                    <button onClick={() => sendResponse('respond_complete', 'no')} className="flex-1 py-3 border border-red-200 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100">Not Yet</button>
                    <button onClick={() => sendResponse('respond_complete', 'yes')} className="flex-1 py-3 bg-green-600 rounded-xl font-semibold text-white hover:bg-green-700">Yes, Completed</button>
                </div>
            </div>
        </div>
      )}

      {showRatingModal && (
        <RatingModal 
            bookingId={id} 
            onClose={() => setShowRatingModal(false)} 
            onSuccess={handleRatingSuccess} 
        />
      )}

      {showComplaintModal && (
        <ComplaintModal 
            bookingId={id} 
            onClose={() => setShowComplaintModal(false)} 
            onSuccess={handleComplaintSuccess} 
        />
      )}

      {data ? (
        <>
          <BookingInfo 
            data={data} 
            onChatClick={handleChatClick} 
            bookingId={id} 
            travelStatus={travelStatus?.travel_status} 
            onRatingClick={() => setShowRatingModal(true)}
            hasRated={data.is_rated} 
            onComplaintClick={() => setShowComplaintModal(true)}
            hasComplaint={data.has_complaint}
            onCancelSuccess={() => navigate('/booking-history')}
            unreadCount={bookingUnreadCounts[id] || 0}
            apiClient={apiClient} 
          />
          {data.booking_status === 'CONFIRMED' && travelStatus && <TravelStatus travelStatus={travelStatus} />}
        </>
      ) : (
        <div className="text-gray-600">Loading...</div>
      )}
    </CustomerLayout>
  );
}

export default BookingDetailsPage;