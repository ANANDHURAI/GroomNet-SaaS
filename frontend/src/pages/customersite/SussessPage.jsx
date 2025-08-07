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
        console.log(" Navigating to FindBarbers with booking_id:", bookingId);
        navigate('/find-barber/?booking_id=' + bookingId);

      } else {
        console.error("No instantBookingId found in sessionStorage");
        navigate('/booking-history');
      }
    } else {
      navigate('/booking-history');
    }
  };


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
         <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
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
             
              <div className="absolute inset-0 w-24 h-24 border-4 border-green-200 rounded-full animate-ping mx-auto"></div>
              <div className="absolute inset-0 w-32 h-32 border-2 border-green-100 rounded-full animate-pulse mx-auto -m-4"></div>
            </div>

         
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your payment has been processed successfully. You can find your booking details in your history.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleButtonClick}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {bookingType === 'INSTANT_BOOKING' ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Barber Now
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Booking History
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </button>
            </div>

            
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20"></div>
          </div>

          
          <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full animate-float opacity-60"></div>
          <div className="absolute bottom-32 right-16 w-3 h-3 bg-green-200 rounded-full animate-float opacity-60" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-purple-200 rounded-full animate-float opacity-60" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default SuccessPage;
