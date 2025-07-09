import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import CustomerLayout from "../../components/customercompo/CustomerLayout";
import { Clock, Car, MapPin, CheckCircle, Loader2 } from "lucide-react";

function StatusChecking() {
  const { bookingId } = useParams();
  const [travelStatus, setTravelStatus] = useState("NOT_STARTED");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTravelStatus = async (bookingId) => {
    try {
      const response = await apiClient.get(
        `/customersite/booking/${bookingId}/get-travel-status/`
      );
      setTravelStatus(response.data.travel_status);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching travel status", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchTravelStatus(bookingId);
      const interval = setInterval(() => fetchTravelStatus(bookingId), 3000);
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  const statusInfo = {
    NOT_STARTED: {
      icon: <Clock className="w-8 h-8" />,
      color: "bg-amber-400",
      textColor: "text-amber-800",
      label: "Not Started",
    },
    STARTED: {
      icon: <Loader2 className="w-8 h-8 animate-spin" />,
      color: "bg-blue-400",
      textColor: "text-blue-800",
      label: "Started",
    },
    ON_THE_WAY: {
      icon: <Car className="w-8 h-8" />,
      color: "bg-indigo-400",
      textColor: "text-indigo-800",
      label: "On The Way",
    },
    ALMOST_NEAR: {
      icon: <MapPin className="w-8 h-8" />,
      color: "bg-purple-400",
      textColor: "text-purple-800",
      label: "Almost Near",
    },
    ARRIVED: {
      icon: <CheckCircle className="w-8 h-8" />,
      color: "bg-green-400",
      textColor: "text-green-800",
      label: "Arrived",
    },
  };

  const currentStatus = statusInfo[travelStatus] || statusInfo.NOT_STARTED;

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Baeber Journey Status
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`p-6 rounded-2xl shadow-md ${currentStatus.color} text-white text-center`}
            >
              <div className="flex justify-center mb-3">
                {currentStatus.icon}
              </div>
              <h3 className="text-xl font-bold mb-1">{currentStatus.label}</h3>
              <p className="text-sm">Booking ID: {bookingId}</p>
            </div>

        
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${currentStatus.color} rounded-full transition-all duration-500`}
                  style={{
                    width: `${(Object.keys(statusInfo).indexOf(travelStatus) / 
                            (Object.keys(statusInfo).length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm font-medium">
                {Object.values(statusInfo).map((status, index) => (
                  <span
                    key={index}
                    className={currentStatus.textColor}
                  >
                    {status.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <span className={`px-4 py-2 rounded-full ${currentStatus.color} ${currentStatus.textColor} font-bold`}>
                Current Status: {currentStatus.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default StatusChecking;