import React, { useState, useEffect } from 'react';
import { Bell, User, MapPin, IndianRupee, Clock, X, Check, AlertCircle } from 'lucide-react';

const GlobalBookingNotifier = ({ 
  currentBooking, 
  notification, 
  setNotification, 
  navigate, // Accept navigate as prop
  location, // Accept location as prop
  isOnWorkingAreaPage = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Only show notification if we have a pending booking and we're NOT on the working area page
    if (currentBooking?.status === 'PENDING' && !isOnWorkingAreaPage) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio not available');
      }
    } else {
      setIsVisible(false);
    }
  }, [currentBooking, isOnWorkingAreaPage]);

  const handleAccept = () => {
    setIsAnimating(false);
    setTimeout(() => {
      // Navigate to the instant booking page
      navigate('/instant-booking/');
      setNotification?.('Redirected to accept booking');
    }, 300);
  };

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleViewDetails = () => {
    // Navigate to the instant booking page
    navigate('/instant-booking/');
  };

  if (!isVisible || !currentBooking) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleDismiss}
      />
      
      {/* Desktop Notification Card */}
      <div className={`hidden md:block fixed top-4 right-4 w-96 z-50 transform transition-all duration-300 ease-out ${
        isAnimating ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header with pulsing indicator */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">New Booking Request!</h3>
                  <p className="text-blue-100 text-sm">Tap to respond</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Customer Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentBooking.customer_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {currentBooking.customer_name}
                </p>
                <p className="text-sm text-gray-600">Customer</p>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="font-medium text-gray-700">Service</span>
                </div>
                <span className="font-semibold text-blue-700">{currentBooking.service_name}</span>
              </div>

              {currentBooking.address && (
                <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Location</span>
                    <p className="text-green-700 text-sm mt-1">{currentBooking.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-gray-700">Amount</span>
                </div>
                <span className="font-bold text-yellow-700 text-lg">₹{currentBooking.total_amount}</span>
              </div>
            </div>

            {/* Urgency indicator */}
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <Clock className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-red-700 text-sm font-medium">Respond quickly to secure this booking!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-5 h-5" />
              Go to Accept Booking
            </button>
            
            <button
              onClick={handleViewDetails}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom notification */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-800">New Booking!</span>
              </div>
              <button onClick={handleDismiss} className="text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm"><strong>{currentBooking.customer_name}</strong> • {currentBooking.service_name}</p>
              <p className="text-lg font-bold text-green-600">₹{currentBooking.total_amount}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={handleViewDetails}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification dot for minimal distraction when collapsed */}
      {!isAnimating && (
        <div 
          className="fixed top-4 right-4 z-50 cursor-pointer transform hover:scale-110 transition-transform"
          onClick={() => setIsAnimating(true)}
        >
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Bell className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-red-800">1</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalBookingNotifier;