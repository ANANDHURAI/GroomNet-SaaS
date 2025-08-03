import { MessageSquare, MapPin, XCircle, Star, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import apiClient from '../../../slices/api/apiIntercepters';

function ActionButtons({ 
  bookingStatus, 
  onChatClick, 
  bookingId, 
  travelStatus, 
  onCancelSuccess,
  onRatingClick,
  hasRated,
  onComplaintClick,
  hasComplaint,
  unreadCount = 0
}) {
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

  const canCancelBooking = bookingStatus === 'CONFIRMED' && 
                          travelStatus && 
                          !['ALMOST_NEAR', 'ARRIVED'].includes(travelStatus);

  const canShowRating = bookingStatus === 'COMPLETED';
  const canShowComplaint = bookingStatus === 'COMPLETED';
  const showChatButton = !['COMPLETED', 'CANCELLED'].includes(bookingStatus);

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
    <div className="flex flex-col items-center gap-4 mt-6">
      {showChatButton && (
        <button
          onClick={onChatClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors relative"
        >
          <MessageSquare size={18} />
          Chat with Beautician
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      <Link
        to={`/booking-status/${bookingId}`}
        className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors"
      >
        <MapPin size={18} />
        Track Your Booking
      </Link>

      {canCancelBooking && (
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle size={18} />
          {isLoading ? 'Cancelling...' : 'Emergency Cancel'}
        </button>
      )}

      {canShowRating && (
        <button
          onClick={onRatingClick}
          disabled={hasRated}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            hasRated 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          <Star size={18} />
          {hasRated ? 'Already Rated' : 'Rate Service'}
        </button>
      )}

      {canShowComplaint && (
        <button
          onClick={onComplaintClick}
          disabled={hasComplaint}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            hasComplaint 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <AlertTriangle size={18} />
          {hasComplaint ? 'Complaint Submitted' : 'File Complaint'}
        </button>
      )}
      
      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
}

export default ActionButtons;