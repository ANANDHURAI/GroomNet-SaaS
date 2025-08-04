import React, { useState, useEffect } from 'react';
import { User, Clock, MapPin, IndianRupee, Check, X } from 'lucide-react';

export const BookingRequestCard = ({ booking, onAccept, onReject, loading }) => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onReject]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 border border-gray-100 backdrop-blur-sm">
        <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce"></div>
        <div className="absolute top-8 right-8 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce delay-200"></div>
     
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                New Request
              </h3>
              <p className="text-sm text-gray-500 font-medium">Urgent booking</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-2 border-orange-200 shadow-sm">
                ⏳ Pending
              </span>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-3 py-2 rounded-xl border border-red-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-mono font-bold text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="group/item bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Customer</p>
                <p className="text-xl font-bold text-gray-900">{booking.customer_name}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-purple-600 uppercase">Service</p>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{booking.service_name}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-green-600 uppercase">Amount</p>
              </div>
              <p className="text-lg font-bold text-gray-900">₹{booking.total_amount}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Location</p>
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">{booking.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onAccept}
            disabled={loading}
            className="flex-1 relative group/btn bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
            <Check className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Accept</span>
            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          </button>
          
          <button
            onClick={onReject}
            disabled={loading}
            className="flex-1 relative group/btn bg-gradient-to-r from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
            <X className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
};
