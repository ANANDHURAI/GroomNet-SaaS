import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";
import { 
  Home, 
  Car, 
  Map, 
  MapPin, 
  CheckCircle, 
  Loader2,
  User,
  Scissors,
  CreditCard,
  ChevronRight
} from "lucide-react";
import Message from "../../components/customercompo/booking/Message";

function TravelPage() {
  const { bookingId } = useParams();
  const [currentStatus, setCurrentStatus] = useState("NOT_STARTED");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [notification, setNotification] = useState(""); 

  const navigate = useNavigate();

  const statusFlow = [
    {
      key: "NOT_STARTED",
      label: "Not Started",
      icon: <Home className="w-5 h-5" />,
      color: "gray",
      description: "Ready to begin your journey"
    },
    {
      key: "STARTED",
      label: "Started",
      icon: <Car className="w-5 h-5" />,
      color: "green",
      description: "Journey has begun"
    },
    {
      key: "ON_THE_WAY",
      label: "On the Way",
      icon: <Map className="w-5 h-5" />,
      color: "yellow",
      description: "Traveling to destination"
    },
    {
      key: "ALMOST_NEAR",
      label: "Almost Near",
      icon: <MapPin className="w-5 h-5" />,
      color: "orange",
      description: "Almost at customer location"
    },
    {
      key: "ARRIVED",
      label: "Arrived",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "blue",
      description: "Reached customer location"
    }
  ];

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await apiClient.get(`/customersite/booking/${bookingId}/`);
        setBookingDetails(response.data);
        setCurrentStatus(response.data.travel_status || "NOT_STARTED");
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const updateStatus = async (status) => {
    setIsLoading(true);
    try {
      const response = await apiClient.patch(
        `/customersite/booking/${bookingId}/update-travel-status/`,
        { travel_status: status }
      );
      
      setCurrentStatus(status);
      const statusLabel = statusFlow.find(s => s.key === status)?.label;
      showNotification(`Status updated to ${statusLabel}`);
      
    } catch (error) {
      console.error("Failed to update status:", error);
      showNotification("Failed to update travel status");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000); 
  };

  const getCurrentStatusIndex = () => {
    return statusFlow.findIndex(status => status.key === currentStatus);
  };

  const getNextStatus = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getGradientClass = (color) => {
    const gradients = {
      gray: "from-gray-400 to-gray-500",
      green: "from-emerald-400 to-emerald-500",
      yellow: "from-yellow-400 to-orange-400",
      orange: "from-orange-400 to-red-400",
      blue: "from-blue-400 to-indigo-500"
    };
    return gradients[color] || gradients.gray;
  };

  const nextStatus = getNextStatus();
  const currentStatusIndex = getCurrentStatusIndex();

return (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="w-72">
      <BarberSidebar />
    </div>
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Travel Status Update
          </h1>
          <p className="text-gray-600 text-lg">
            Keep your customer informed about your journey progress
          </p>
        </div>

        {bookingDetails && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Booking Details</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                #{bookingId}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-800">{bookingDetails.customer?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Scissors className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-semibold text-gray-800">{bookingDetails.service?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-full">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-semibold text-gray-800">#{bookingId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                <div className="p-2 bg-orange-100 rounded-full">
                  <span className="text-orange-600 font-bold">₹</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-gray-800">₹{bookingDetails.total_amount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Journey Progress</h2>
            
            <div className="relative mb-8">
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
              <div 
                className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (statusFlow.length - 1)) * 100 : 0}%` }}
              ></div>
              
              <div className="flex justify-between items-center relative">
                {statusFlow.map((status, index) => (
                  <div key={status.key} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-full border-3 flex items-center justify-center transition-all duration-500 ${
                        index <= currentStatusIndex
                          ? `bg-gradient-to-r ${getGradientClass(status.color)} text-white shadow-lg scale-110 border-transparent`
                          : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {React.cloneElement(status.icon, {
                        className: `w-6 h-6 ${index <= currentStatusIndex ? 'text-white' : 'text-gray-400'}`
                      })}
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-medium ${
                        index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="text-xl font-semibold text-gray-800 mb-2">
                Current Status: {statusFlow[currentStatusIndex]?.label}
              </div>
              <div className="text-gray-600">
                {statusFlow[currentStatusIndex]?.description}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Update Status</h2>
          {currentStatus === "ARRIVED" ? (
            <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                You've Arrived!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                You've reached the customer's location. Ready to provide exceptional service!
              </p>
              <button
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => navigate(`/barber/service-complete/${bookingId}`)}
              >
                Start Service Now
              </button>
            </div>
          ) : (
            nextStatus && (
              <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-full bg-gradient-to-r ${getGradientClass(nextStatus.color)} text-white shadow-lg`}>
                      {React.cloneElement(nextStatus.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-gray-800">
                        Next: {nextStatus.label}
                      </div>
                      <div className="text-gray-600">
                        {nextStatus.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateStatus(nextStatus.key)}
                    disabled={isLoading}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center shadow-lg ${
                      isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Status</span>
                        <ChevronRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
    {notification && <Message message={notification} />}
  </div>
);
}

export default TravelPage;
