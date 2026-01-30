import React, { useState } from 'react';
import { Calendar, Clock, User, Scissors, CreditCard, MapPin, MessageSquare, Star, AlertTriangle, XCircle } from 'lucide-react';

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
  apiClient 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCancelBooking = data.booking_status === 'CONFIRMED' && 
                           travelStatus && 
                           !['ALMOST_NEAR', 'ARRIVED'].includes(travelStatus);
  
  // ✅ Only show buttons if booking is COMPLETED
  const canShowRating = data.booking_status === 'COMPLETED';
  const canShowComplaint = data.booking_status === 'COMPLETED';
  const showChatButton = !['COMPLETED', 'CANCELLED'].includes(data.booking_status);

  const handleEmergencyCancel = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/customersite/booking/${bookingId}/cancel/`);
      alert(`Booking cancelled successfully!\nRefund: ₹${response.data.refund_amount}`);
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
      <div className="bg-white p-6 rounded-lg max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Confirm Emergency Cancellation</h3>
        <p className="text-gray-600 mb-4">Are you sure? A 10% fee applies.</p>
        <div className="flex gap-4 justify-end">
          <button onClick={() => setShowConfirmDialog(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">No</button>
          <button onClick={handleEmergencyCancel} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Booking Details</h3>
          <p className="text-blue-100 mt-1">Order #{data.orderid || data.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium bg-white ${getStatusColor(data.booking_status).split(' ')[1]}`}>
          {data.booking_status}
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        {showChatButton && (
          <button onClick={onChatClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 relative shadow-sm">
            <MessageSquare size={16} /> Chat
            {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unreadCount}</span>}
          </button>
        )}

        {/* ✅ RATING BUTTON */}
        {canShowRating && (
          <button 
            onClick={!hasRated ? onRatingClick : undefined} 
            disabled={hasRated}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                hasRated 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            <Star size={16} /> {hasRated ? 'Rated' : 'Rate'}
          </button>
        )}

        {/* ✅ COMPLAINT BUTTON */}
        {canShowComplaint && (
          <button 
            onClick={!hasComplaint ? onComplaintClick : undefined} 
            disabled={hasComplaint}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                hasComplaint 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <AlertTriangle size={16} /> {hasComplaint ? 'Filed' : 'Complain'}
          </button>
        )}

        {canCancelBooking && (
          <button onClick={() => setShowConfirmDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <XCircle size={16} /> Cancel
          </button>
        )}
      </div>

      {/* Info Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
           <h4 className="font-semibold text-gray-900 border-b pb-2">Service Information</h4>
           <div className="flex gap-3 items-start"><Scissors className="text-blue-500 mt-1" size={16} /><div className='flex flex-col'><span className='text-xs text-gray-500'>Service</span><span className="font-medium text-gray-800">{data.service}</span></div></div>
           <div className="flex gap-3 items-start"><User className="text-green-500 mt-1" size={16} /><div className='flex flex-col'><span className='text-xs text-gray-500'>Beautician</span><span className="font-medium text-gray-800">{data.barbername}</span></div></div>
        </div>
        <div className="space-y-4">
           <h4 className="font-semibold text-gray-900 border-b pb-2">Booking Details</h4>
           <div className="flex gap-3 items-start"><Calendar className="text-red-500 mt-1" size={16} /><div className='flex flex-col'><span className='text-xs text-gray-500'>Date & Time</span><span className="font-medium text-gray-800">{data.date} at {data.slottime}</span></div></div>
           <div className="flex gap-3 items-start"><CreditCard className="text-orange-500 mt-1" size={16} /><div className='flex flex-col'><span className='text-xs text-gray-500'>Payment Method</span><span className="font-medium text-gray-800">{data.payment_method}</span></div></div>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
        <span className="text-lg font-semibold text-gray-700">Total Amount</span>
        <span className="text-2xl font-bold text-green-600">₹{data.total_amount}</span>
      </div>

      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
}

export default BookingInfo;