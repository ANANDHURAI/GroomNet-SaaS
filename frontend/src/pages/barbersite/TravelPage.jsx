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
      showNotification(`✅ Status updated to ${statusLabel}`);
      
    } catch (error) {
      console.error("Failed to update status:", error);
      showNotification("❌ Failed to update travel status");
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

  const getColorClasses = (color, isActive = false) => {
    const colorMap = {
      gray: isActive ? "bg-gray-600 border-gray-500" : "bg-gray-100 border-gray-300 text-gray-600",
      green: isActive ? "bg-green-600 border-green-500" : "bg-green-100 border-green-300 text-green-700",
      yellow: isActive ? "bg-yellow-500 border-yellow-400" : "bg-yellow-100 border-yellow-300 text-yellow-700",
      orange: isActive ? "bg-orange-500 border-orange-400" : "bg-orange-100 border-orange-300 text-orange-700",
      blue: isActive ? "bg-blue-600 border-blue-500" : "bg-blue-100 border-blue-300 text-blue-700"
    };
    return colorMap[color] || colorMap.gray;
  };

  const nextStatus = getNextStatus();
  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64">
        <BarberSidebar />
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Travel Status Update
            </h1>
            <p className="text-gray-600">
              Keep your customer informed about your journey progress
            </p>
            {bookingDetails && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-500">Customer:</span>
                    <span className="ml-2 font-medium">{bookingDetails.customer?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Scissors className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-500">Service:</span>
                    <span className="ml-2 font-medium">{bookingDetails.service?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-500">Booking ID:</span>
                    <span className="ml-2 font-medium">#{bookingId}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-medium">₹{bookingDetails.total_amount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Journey Progress</h2>
              
              <div className="relative mb-8">
                <div className="flex justify-between items-center">
                  {statusFlow.map((status, index) => (
                    <div key={status.key} className="flex flex-col items-center relative">
                      <div
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          index <= currentStatusIndex
                            ? `${getColorClasses(status.color, true)} text-white shadow-lg`
                            : `${getColorClasses(status.color, false)} hover:shadow-md`
                        }`}
                      >
                        {React.cloneElement(status.icon, {
                          className: `w-5 h-5 ${index <= currentStatusIndex ? 'text-white' : ''}`
                        })}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-medium ${
                          index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {status.label}
                        </div>
                      </div>
                      
                      {index < statusFlow.length - 1 && (
                        <div className="absolute top-6 left-12 w-full h-0.5 bg-gray-200">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-800 mb-1">
                  Current Status: {statusFlow[currentStatusIndex]?.label}
                </div>
                <div className="text-sm text-gray-600">
                  {statusFlow[currentStatusIndex]?.description}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ ARRIVED STATUS */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Update Status</h2>
            {currentStatus === "ARRIVED" ? (
              <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  You've Arrived!
                </h3>
                <p className="text-green-600 mb-6">
                  You’ve reached the customer's location. You can now start the service.
                </p>
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  onClick={() => navigate(`/barber/service-complete/${bookingId}`)}
                >
                  Start Service Now
                </button>
              </div>
            ) : (
             
              nextStatus && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        {nextStatus.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Next: {nextStatus.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {nextStatus.description}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => updateStatus(nextStatus.key)}
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center ${
                        isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>Update Status</span>
                          <ChevronRight className="w-4 h-4 ml-2" />
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
