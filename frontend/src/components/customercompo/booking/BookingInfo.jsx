import { Calendar, Clock, User, Scissors, CreditCard, MapPin, Hash, MessageSquare, Star, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';

function BookingInfo({ 
  data, 
  timeLeft,
  onChatClick,
  bookingId,
  travelStatus,
  onCancelSuccess,
  onRatingClick,
  hasRated,
  onComplaintClick,
  hasComplaint,
  unreadCount = 0,
  apiClient // You'll need to pass this as a prop
}) {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Action button logic
  const canCancelBooking = data.booking_status === 'CONFIRMED' && 
                          travelStatus && 
                          !['ALMOST_NEAR', 'ARRIVED'].includes(travelStatus);
  const canShowRating = data.booking_status === 'COMPLETED';
  const canShowComplaint = data.booking_status === 'COMPLETED';
  const showChatButton = !['COMPLETED', 'CANCELLED'].includes(data.booking_status);

  // Cancel functionality
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleEmergencyCancel = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/customersite/booking/${bookingId}/cancel/`);
      
      alert(`Booking cancelled successfully!\nFine: ₹${response.data.fine_amount}\nRefund: ₹${response.data.refund_amount}`);
     
      onCancelSuccess?.();
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel booking';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Emergency Cancellation</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to cancel this booking? A 10% cancellation fee will be charged.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            No, Keep Booking
          </button>
          <button
            onClick={handleEmergencyCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Booking Details</h3>
            <p className="text-blue-100 mt-1">Order #{data.orderid}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(data.booking_status)} bg-white`}>
            {data.booking_status}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {showChatButton && (
            <button
              onClick={onChatClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative shadow-sm"
            >
              <MessageSquare size={16} />
              <span className="font-medium">Chat</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}

          <a
            href={`/booking-status/${bookingId}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <MapPin size={16} />
            <span className="font-medium">Track</span>
          </a>

          {canCancelBooking && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={16} />
              <span className="font-medium">{isLoading ? 'Cancelling...' : 'Cancel'}</span>
            </button>
          )}

          {canShowRating && (
            <button
              onClick={onRatingClick}
              disabled={hasRated}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                hasRated 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              <Star size={16} />
              <span className="font-medium">{hasRated ? 'Rated' : 'Rate'}</span>
            </button>
          )}

          {canShowComplaint && (
            <button
              onClick={onComplaintClick}
              disabled={hasComplaint}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                hasComplaint 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <AlertTriangle size={16} />
              <span className="font-medium">{hasComplaint ? 'Filed' : 'Complain'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Time Left Banner */}
      {timeLeft && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex items-center">
            <Clock className="text-amber-600 mr-2" size={16} />
            <span className="text-amber-800 font-medium">{timeLeft}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Service Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Service Information</h4>
            
            <div className="flex items-start space-x-3">
              <Scissors className="text-blue-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium text-gray-900">{data.service}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="text-green-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-600">Beautician</p>
                <p className="font-medium text-gray-900">{data.barbername}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="text-purple-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-600">Booking Type</p>
                <p className="font-medium text-gray-900">{data.booking_type}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Booking Details</h4>
            
            <div className="flex items-start space-x-3">
              <User className="text-indigo-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium text-gray-900">{data.name}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="text-red-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900">{data.date} at {data.slottime}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CreditCard className="text-orange-500 mt-1 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-gray-600">Payment</p>
                <p className="font-medium text-gray-900">{data.payment_method}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
            <span className="text-lg font-semibold text-gray-700">Total Amount</span>
            <span className="text-2xl font-bold text-green-600">₹{data.total_amount}</span>
          </div>
        </div>
      </div>

      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
}

export default BookingInfo;