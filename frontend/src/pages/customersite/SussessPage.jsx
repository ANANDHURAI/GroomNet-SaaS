import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';

function SuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const bookingType = sessionStorage.getItem('bookingType');

  useEffect(() => {
    const sessionId = params.get('session_id');

    if (sessionId) {
      apiClient
        .post('/payment-service/verify-payment/', { session_id: sessionId })
        .then((res) => {
          console.log('Payment Verified:', res.data.message);
        })
        .catch((err) => {
          console.error('Error verifying payment:', err.response?.data || err.message);
        });
    }
  }, []);

  const handleButtonClick = () => {
    if (bookingType === 'INSTANT_BOOKING') {
      const bookingId = sessionStorage.getItem('instantBookingId');
      if (bookingId) {
        console.log("✅ Navigating to FindBarbers with booking_id:", bookingId);
        navigate('/find-barber/?booking_id=' + bookingId);

      } else {
        console.error("❌ No instantBookingId found in sessionStorage");
        navigate('/booking-history');
      }
    } else {
      navigate('/booking-history');
    }
  };


  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">You will find your booking in your history.</p>

          <button
            onClick={handleButtonClick}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {bookingType === 'INSTANT_BOOKING' ? 'Find Barber' : 'View Booking History'}
          </button>
        </div>
      </div>
    </>
  );
}

export default SuccessPage;
