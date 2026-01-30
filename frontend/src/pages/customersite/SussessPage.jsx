import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';

function SuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const bookingType = sessionStorage.getItem('bookingType');

  const [verifying, setVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setVerifying(false);
      setPaymentVerified(true);
      return;
    }

    apiClient
      .post('/payment-service/verify-payment/', { session_id: sessionId })
      .then((res) => {
        setPaymentVerified(true);
        setVerifying(false);

        if (bookingType === 'INSTANT_BOOKING' && res.data.booking_id) {
          sessionStorage.setItem('instantBookingId', res.data.booking_id);

          navigate(
            `/find-barbers?booking_id=${res.data.booking_id}`,
            { replace: true }
          );
        }
      })
      .catch((err) => {
        console.error('Payment verification failed:', err);
        setVerifying(false);
      });
  }, []);

  if (verifying) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <h2 className="text-lg font-semibold">Verifying payment...</h2>
          </div>
        </div>
      </>
    );
  }

  if (paymentVerified && bookingType === 'INSTANT_BOOKING') {
    return null;
  }


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">

            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-3">Booking Confirmed</h1>
            <p className="text-gray-600 mb-6">
              Your payment was successful. You can view your booking history below.
            </p>

            <button
              onClick={() => navigate('/booking-history')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              View Booking History
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SuccessPage;
