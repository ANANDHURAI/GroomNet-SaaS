import { MessageSquare, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function ActionButtons({ bookingStatus, onChatClick, bookingId }) {
  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {bookingStatus !== 'COMPLETED' && bookingStatus !== 'CANCELLED' && (
        <button
          onClick={onChatClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          <MessageSquare size={18} />
          Chat with Beautician
        </button>
      )}

      <Link
        to={`/booking-status/${bookingId}`}
        className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors"
      >
        <MapPin size={18} />
        Track Your Booking
      </Link>
    </div>
  );
}

export default ActionButtons;
