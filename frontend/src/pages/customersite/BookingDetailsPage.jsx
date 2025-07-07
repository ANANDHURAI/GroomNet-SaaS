import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import { Truck, Clock, MessageSquare, MapPin } from 'lucide-react';

function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [travelStatus, setTravelStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    apiClient.get(`/customersite/booking-details/${id}/`)
      .then(res => {
        console.log("Booking data:", res.data);
        setData(res.data);
        calculateTimeLeft(res.data.date, res.data.slottime);
        
     
        const bookingIdToUse = res.data.id || res.data.orderid; 
        console.log("Using booking ID for travel status:", bookingIdToUse);
        fetchTravelStatus(bookingIdToUse);
      })
      .catch(err => console.error("Booking fetch error", err));
  }, [id]);

  const calculateTimeLeft = (date, time) => {
    if (time === "N/A") {
      setTimeLeft("No scheduled time (instant booking)");
      return;
    }
    const serviceTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = serviceTime - now;
    if (diff <= 0) return setTimeLeft("Service is active now");

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    setTimeLeft(`${hrs}h ${rem}m remaining`);
  };

  const fetchTravelStatus = async (bookingId) => {
    try {
      const res = await apiClient.get(`/customersite/booking/${bookingId}/get-travel-status/`);
      setTravelStatus(res.data);
    } catch (err) {
      console.warn("Travel status not available");
    }
  };

  const handleChatClick = () => {
    navigate(`/customer/chat/${id}`, {
      state: {
        bookingData: data,
        barberName: data.barbername
      }
    });
  };

  return (
    <CustomerLayout>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>

      {data ? (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Order ID:</strong> #{data.orderid}</p>
              <p><strong>Service:</strong> {data.service}</p>
              <p><strong>Status:</strong> {data.booking_status}</p>
            </div>
            <div>
              <p><strong>Customer:</strong> {data.name}</p>
              <p><strong>Barber:</strong> {data.barbername}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {data.date}</p>
              <p><strong>Time:</strong> {data.slottime}</p>
              <p className="text-sm text-blue-600 mt-1">{timeLeft}</p>
            </div>
            <div>
              <p><strong>Payment:</strong> {data.payment_method}</p>
              <p><strong>Amount:</strong> ₹{data.total_amount}</p>
              <p><strong>Booking Type:</strong> {data.booking_type}</p>
            </div>
          </div>

          {data.booking_status === 'CONFIRMED' && travelStatus && (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mt-4">
              <h3 className="text-blue-800 flex items-center gap-2 font-semibold mb-2">
                <Truck size={18} /> Travel Status
              </h3>
              <p><strong>Status:</strong> {travelStatus.travel_status}</p>
              <p className="mt-1">
                <Clock size={14} className="inline mr-1" />
                <strong>ETA:</strong> {travelStatus.eta} | <strong>Distance:</strong> {travelStatus.distance}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mt-6">
            {data.booking_status !== 'COMPLETED' && data.booking_status !== 'CANCELLED' && (
              <button
                onClick={handleChatClick}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                <MessageSquare size={18} />
                Chat with Beautician
              </button>
            )}

            <Link
              to={`/booking-status/${id}`}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors"
            >
              <MapPin size={18} />
              Track Your Booking
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-gray-600">Loading booking details...</div>
      )}
    </CustomerLayout>
  );
}

export default BookingDetailsPage;