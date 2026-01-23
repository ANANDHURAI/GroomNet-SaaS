import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import { useNotifications } from '../../components/customHooks/useNotifications';
import NotificationBadge from '../../components/notification/NotificationBadge';

function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const navigate = useNavigate();
  const { totalUnreadCount, bookingUnreadCounts } = useNotifications();

  useEffect(() => {
    apiClient
      .get('/customersite/booking-history/')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load booking history", err);
        setError("Failed to load booking history.");
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBookingTypeColor = (type) => {
    switch (type) {
      case 'home_visit':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'clinic_visit':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'online':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-64"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">
                My Bookings
              </h4>
              <p className="text-lg text-gray-600">
                Manage and track all your appointments
              </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Total Bookings: <span className="text-blue-600 font-bold">{bookings.length}</span>
              </span>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-500 text-lg font-medium">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">Start booking your first appointment to see it here.</p>
            <button 
              onClick={() => navigate('/home')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="group relative bg-white hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all duration-300 p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredBooking(booking.id)}
                onMouseLeave={() => setHoveredBooking(null)}
              >
               
                {bookingUnreadCounts[booking.id] > 0 && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <NotificationBadge count={bookingUnreadCounts[booking.id]} />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-red-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {booking.service}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getBookingTypeColor(booking.booking_type)}`}>
                        {booking.booking_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">{booking.date}</span>
                      </div>
                      
                      {booking.slottime !== "N/A" && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{booking.slottime}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="font-bold text-lg text-purple-600">₹{booking.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <span className={`px-4 py-2 text-xs font-bold rounded-full border ${getStatusColor(booking.booking_status)}`}>
                      {booking.booking_status}
                    </span>
                    
                    <button
                      onClick={() => navigate(`/booking-details/${booking.id}`)}
                      className="relative group/btn px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="flex items-center gap-2">
                        View Details
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      
                      {bookingUnreadCounts[booking.id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-bounce">
                          {bookingUnreadCounts[booking.id] > 9 ? '9+' : bookingUnreadCounts[booking.id]}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      booking.booking_status === 'COMPLETED' ? 'w-full bg-green-500' :
                      booking.booking_status === 'CONFIRMED' ? 'w-3/4 bg-blue-500' :
                      booking.booking_status === 'PENDING' ? 'w-1/2 bg-yellow-500' :
                      'w-1/4 bg-red-500'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default BookingHistoryPage;