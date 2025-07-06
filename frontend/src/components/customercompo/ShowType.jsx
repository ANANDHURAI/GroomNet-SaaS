import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ShowType() {
  const navigate = useNavigate();

  const handleInstantBooking = () => {

    sessionStorage.setItem('bookingType', 'INSTANT_BOOKING')
    navigate('/customer/categoryes');
  };

  const handleScheduleBooking = () => {
    sessionStorage.setItem('bookingType', 'SCHEDULE_BOOKING');
    navigate('/customer/categoryes');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          What do you want?
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Choose your preferred booking option to get started with our services
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-1 group">
          <button
            onClick={handleInstantBooking}
            className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-opacity-30 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Booking</h3>
              <p className="text-purple-100 text-sm leading-relaxed">
                Book immediately and get your service right away. Perfect for walk-ins and urgent needs.
              </p>
              <div className="mt-6 px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                Available Now
              </div>
            </div>
          </button>
        </div>

        <div onClick={handleScheduleBooking} className="flex-1 group cursor-pointer">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-opacity-30 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Schedule Booking</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Plan ahead and book your preferred time slot. Choose the date and time that works best for you.
              </p>
              <div className="mt-6 px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                Plan Ahead
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Need help deciding? Our team is available 24/7 to assist you
        </p>
      </div>
    </div>
  );
}

export default ShowType;
