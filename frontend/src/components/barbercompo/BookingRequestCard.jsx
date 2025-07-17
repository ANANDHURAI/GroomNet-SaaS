import React from 'react';
import { User, Clock, MapPin, IndianRupee, Check, X } from 'lucide-react';

const BookingRequestCard = ({ booking, onAccept, onReject, loading }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-orange-400">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">
        New Booking Request
      </h3>
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        Pending
      </span>
    </div>

    <div className="space-y-3 mb-6">
      <div className="flex items-center space-x-3">
        <User className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          {booking.customer_name}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          {booking.service_name} ({booking.duration} mins)
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <IndianRupee className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          ₹{booking.price}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">
          {booking.customer_location.address}
        </span>
      </div>
    </div>

    <div className="flex space-x-3">
      <button
        onClick={onAccept}
        disabled={loading}
        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <Check className="w-4 h-4" />
        <span>Accept</span>
      </button>
      <button
        onClick={onReject}
        disabled={loading}
        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <X className="w-4 h-4" />
        <span>Reject</span>
      </button>
    </div>
  </div>
);

export default BookingRequestCard;