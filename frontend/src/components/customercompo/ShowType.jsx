import React from 'react';
import { useNavigate } from 'react-router-dom';

function ShowType() {
  const navigate = useNavigate();

  const handleInstantBooking = () => {
    sessionStorage.setItem('bookingType', 'INSTANT_BOOKING');
    navigate('/customer/categoryes');
  };

  const handleScheduleBooking = () => {
    sessionStorage.setItem('bookingType', 'SCHEDULE_BOOKING');
    navigate('/customer/categoryes');
  };

  return (
    <div className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 rounded-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-semibold text-purple-700 mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Choose Your Experience
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent">
              What do you
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent">
              want today?
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose your preferred booking option and let us take care of the rest. 
            Your perfect grooming experience is just one click away.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
            <button
              onClick={handleInstantBooking}
              className="relative w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20 hover:bg-white transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-gray-800 mb-4">
                  Instant Booking
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Get groomed right now! Perfect for when you need 
                  immediate service. No waiting, just instant satisfaction.
                </p>
                
                <div className="space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-sm font-semibold text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Available Now
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Immediate
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Fast and Friendly
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
            <button
              onClick={handleScheduleBooking}
              className="relative w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20 hover:bg-white transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-gray-800 mb-4">
                  Schedule Booking
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Plan your perfect grooming session. Choose your preferred date, 
                  time, and service for a seamless experience.
                </p>
                
                <div className="space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-sm font-semibold text-blue-700">
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Plan Ahead
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Guaranteed Slot
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Flexible Timing
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full border border-white/30">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
            </svg>
            <span className="text-gray-600 font-medium">Need help deciding? Our team is available 24/7 to assist you</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowType;
