import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import { 
  Truck, 
  Clock, 
  MessageSquare, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  X,
  Scissors,
  User
} from 'lucide-react';
import Message from '../../components/customercompo/booking/Message';

function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [travelStatus, setTravelStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [serviceSocket, setServiceSocket] = useState(null);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [notification, setNotification] = useState('');

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

  useEffect(() => {
    if (data && data.booking_status === 'CONFIRMED') {
      const wsUrl = `ws://localhost:8000/ws/service/conformation/`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log("Service WebSocket connected");
        setServiceSocket(socket);
      };
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("WebSocket message:", message);
        
        if (message.type === 'service_request') {
          setShowServicePopup(true);
        }
      };
      
      socket.onclose = () => {
        console.log("Service WebSocket disconnected");
        setServiceSocket(null);
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      return () => {
        socket.close();
      };
    }
  }, [data]);

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

  const handleServiceResponse = (response) => {
    if (!serviceSocket) return;
    
    setIsResponding(true);
    
    const message = {
      action: response,
      booking_id: data.id || data.orderid
    };
    
    serviceSocket.send(JSON.stringify(message));
    
    setTimeout(() => {
      setIsResponding(false);
      setShowServicePopup(false);

      if (response === 'ready') {
        setNotification('✅ You confirmed you are ready! The barber will start the service.');
      } else {
        setNotification('⏳ You requested to wait. The barber will wait for 1 minute.');
      }
    }, 1000);
  };

  const handleChatClick = () => {
    navigate(`/customer/chat/${id}`, {
      state: {
        bookingData: data,
        barberName: data.barbername
      }
    });
  };

  const ServiceConfirmationPopup = () => {
    if (!showServicePopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Scissors className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Service Request</h3>
                  <p className="text-sm text-gray-600">From your barber</p>
                </div>
              </div>
              <button
                onClick={() => setShowServicePopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{data?.barbername}</p>
                  <p className="text-sm text-gray-600">Your assigned barber</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  "I've arrived at your location and I'm ready to start the service. Are you ready?"
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleServiceResponse('ready')}
                disabled={isResponding}
                className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center ${
                  isResponding
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-95'
                }`}
              >
                {isResponding ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Responding...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>I'm Ready!</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleServiceResponse('wait')}
                disabled={isResponding}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  isResponding
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-50 active:scale-95'
                }`}
              >
                {isResponding ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Responding...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Please Wait (1 min)</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <strong>Ready:</strong> Service will start immediately<br />
                <strong>Wait:</strong> Barber will wait for 1 minute
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
              
              {travelStatus.travel_status === 'ARRIVED' && (
                <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                  <div className="flex items-center text-green-800">
                    <CheckCircle size={16} className="mr-1" />
                    <span className="text-sm font-medium">Barber has arrived at your location!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {data.booking_status === 'CONFIRMED' && travelStatus?.travel_status === 'ARRIVED' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 mt-4">
              <h3 className="text-green-800 flex items-center gap-2 font-semibold mb-2">
                <Scissors size={18} /> Service Status
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 font-medium">Your barber is ready to start the service</p>
                  <p className="text-sm text-green-600 mt-1">
                    You will receive a notification when the barber wants to begin
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
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

      <ServiceConfirmationPopup />

      {notification && <Message message={notification} />}
    </CustomerLayout>
  );
}

export default BookingDetailsPage;
