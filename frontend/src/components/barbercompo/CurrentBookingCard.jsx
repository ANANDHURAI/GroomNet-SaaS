import React from 'react';
import { User, Clock, MapPin, Phone, IndianRupee } from 'lucide-react';

const CurrentBookingCard = ({ booking, navigate }) => {
  const handleStartService = () => {
    navigate(`/travel-status/${booking.booking_id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-green-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Current Booking
        </h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Confirmed
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {booking.customer_name}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {booking.service_name}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <IndianRupee className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            ₹{booking.price ?? '—'}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {booking.customer_location?.address || '—'}
          </span>
        </div>
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => navigate(`/barber/chat/${booking.booking_id}`)}
        >
          Message
        </button>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          onClick={handleStartService}
        >
          Start Service
        </button>
      </div>
    </div>
  );
};

export default CurrentBookingCard;