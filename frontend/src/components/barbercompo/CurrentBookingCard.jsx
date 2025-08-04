import React from 'react';
import { User, Clock, MapPin, IndianRupee, MessageCircle, Play } from 'lucide-react';
import NotificationBadge from '../notification/NotificationBadge';
import { useNotifications } from '../customHooks/useNotifications';

export const CurrentBookingCard = ({ booking, navigate }) => {
  const { bookingUnreadCounts } = useNotifications();

  const handleStartService = () => {
    navigate(`/travel-status/${booking.booking_id}`);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 animate-pulse"></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 border border-gray-100 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-100 to-green-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
        
        <div className="absolute top-6 right-6 flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 shadow-sm">
            Active
          </span>
        </div>

        <div className="mb-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-xl">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-green-500" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Active Booking
              </h3>
              <p className="text-base text-gray-600 font-semibold">Service in progress</p>
            </div>
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-3xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-sm">👑</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Customer</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{booking.customer_name}</p>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium ml-2">Premium Client</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 group/card">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Service</p>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{booking.service_name}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300 group/card">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Total</p>
              </div>
              <p className="text-xl font-bold text-gray-900">₹{booking.price ?? '—'}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 relative z-10">
          <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 p-6 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Destination</p>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                  {booking.customer_location?.address || 'Address not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

       
        <div className="flex space-x-4 relative z-10">
          <button
            className="flex-1 relative group/btn bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 hover:from-gray-200 hover:via-gray-300 hover:to-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105 active:scale-95 border-2 border-gray-200"
            onClick={() => navigate(`/barber/chat/${booking.booking_id}`)}
          >
           
            {booking.booking_id && bookingUnreadCounts[booking.booking_id] > 0 && (
              <NotificationBadge count={bookingUnreadCounts[booking.booking_id]} />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
            <MessageCircle className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Chat</span>
          </button>
          
          <button
            className="flex-1 relative group/btn bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105 active:scale-95"
            onClick={handleStartService}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center relative z-10">
              <Play className="w-5 h-5 text-green-600 ml-0.5" />
            </div>
            <span className="relative z-10">Start Service</span>
          </button>
        </div>
      </div>
    </div>
  );
};
