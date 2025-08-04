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

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">My Bookings</h2>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading your bookings...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">No bookings found.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white p-4 rounded-lg shadow-md border flex flex-col sm:flex-row justify-between items-start sm:items-center relative"
              >
                {/* Add notification badge for each booking */}
                {bookingUnreadCounts[booking.id] > 0 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <NotificationBadge count={bookingUnreadCounts[booking.id]} />
                  </div>
                )}

                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-lg text-gray-800">
                    {booking.service}
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      {booking.booking_type.replace('_', ' ')}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600">
                    {booking.date} {booking.slottime !== "N/A" && `— ${booking.slottime}`}
                  </p>

                  <p className="text-sm text-gray-500">
                    Total: ₹{booking.total_amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      booking.booking_status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : booking.booking_status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.booking_status}
                  </span>
                  <button
                    onClick={() => navigate(`/booking-details/${booking.id}`)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition relative"
                  >
                    View Details
                    {bookingUnreadCounts[booking.id] > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {bookingUnreadCounts[booking.id] > 9 ? '9+' : bookingUnreadCounts[booking.id]}
                      </span>
                    )}
                  </button>
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
