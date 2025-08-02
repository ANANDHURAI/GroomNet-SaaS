import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import Message from "../../components/customercompo/booking/Message";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";
import {
  Phone,
  User,
  Home,
  Scissors,
  Gift,
  Wallet,
  BadgeCheck,
  CircleCheck,
  HandCoins,
  AlertCircle,
  CheckCircle,
  Coins,
  WalletCards,
  ArrowRight
} from "lucide-react";

function ServiceCompletePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [notification, setNotification] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [bookingId]);

  const fetchServiceDetails = () => {
    apiClient
      .get(`/instant-booking/complete/service/${bookingId}/`)
      .then((response) => {
        setData(response.data);
        if (response.data.payment_done) {
          setIsCompleted(response.data.status === "COMPLETED");
          if (response.data.payment_method === "COD" && response.data.payment_done) {
            setIsCollected(true);
          }
          if (response.data.status === "COMPLETED") {
            setShowEarnings(true);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching service details:", error);
        setNotification("Failed to load service details");
        setTimeout(() => setNotification(""), 3000);
      });
  };

  const handleCollectAmount = () => {
    setLoading(true);
    
    // Send COD collection acknowledgment to backend
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, {
      action: 'collect_cod'
    })
      .then((response) => {
        setIsCollected(true);
        setNotification("Amount collected from customer! You can now complete the service.");
        setTimeout(() => setNotification(""), 5000);
      })
      .catch((error) => {
        console.error("Error recording COD collection:", error);
        setNotification("Failed to record amount collection");
        setTimeout(() => setNotification(""), 3000);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMarkCompleted = () => {
    setLoading(true);
    
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, {
      action: 'complete_service'
    })
      .then((response) => {
        setIsCompleted(true);
        setShowEarnings(true);
        setNotification("Service marked as completed successfully!");
        setTimeout(() => setNotification(""), 5000);
        
        // Refresh data to get updated status
        fetchServiceDetails();
      })
      .catch((error) => {
        console.error("Error completing service:", error);
        const errorMessage = error.response?.data?.error || "Failed to mark as completed";
        setNotification(errorMessage);
        setTimeout(() => setNotification(""), 5000);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEarningsClick = () => {
    navigate("/barber-earnings");
  };

  const getEarningsAmount = () =>
    data?.payment_method === "COD"
      ? data.service_amount
      : data?.service_amount || data?.price;

  const getCODCollectionAmount = () =>
    parseFloat(data?.service_amount || 0) +
    parseFloat(data?.platform_fee || 0);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg animate-pulse">Loading service details...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <BarberSidebar />
      <div className="flex-1 max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2 mb-6">
          <BadgeCheck className="text-green-600" /> Service Completion
        </h2>

        <div className="grid gap-3 text-gray-800 text-base">
          <p className="flex items-center gap-2"><Gift className="text-green-500" /> <strong>Booking ID:</strong> {data.id}</p>
          <p className="flex items-center gap-2"><User className="text-blue-500" /> <strong>Customer:</strong> {data.customer_name}</p>
          <p className="flex items-center gap-2"><Phone className="text-purple-500" /> <strong>Phone:</strong> {data.customer_phone}</p>
          <p className="flex items-center gap-2"><Home className="text-orange-500" /> <strong>Address:</strong> {data.address}</p>
          <p className="flex items-center gap-2"><Scissors className="text-pink-500" /> <strong>Service:</strong> {data.service}</p>
          <p><strong>Total Price:</strong> ₹{data.price}</p>
          <p><strong>Booking Type:</strong> {data.booking_type}</p>
          <p><strong>Payment Method:</strong> {data.payment_method}</p>
        </div>

        {/* COD Flow */}
        {data.payment_method === "COD" && (
          <div className="mt-8 space-y-4">
            {!isCollected && !isCompleted && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                  <HandCoins /> Collect Amount from Customer
                </h3>
                <p className="text-yellow-700 mt-2">
                  Amount to collect: <strong>₹{getCODCollectionAmount()}</strong><br />
                  <small className="text-gray-600">
                    (Service: ₹{data.service_amount} + Platform Fee: ₹{data.platform_fee})
                  </small>
                </p>
                <button
                  onClick={handleCollectAmount}
                  disabled={loading}
                  className="mt-4 w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HandCoins className="inline mr-1" /> 
                  {loading ? "Processing..." : "Mark as Collected"}
                </button>
              </div>
            )}

            {isCollected && !isCompleted && (
              <div className="bg-blue-100 border border-blue-300 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <CircleCheck /> Amount Collected Successfully
                </h3>
                <p className="text-blue-700 mt-2">Ready to complete the service</p>
                <button
                  onClick={handleMarkCompleted}
                  disabled={loading}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="inline mr-1" /> 
                  {loading ? "Processing..." : "Complete Service"}
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle /> Service Completed Successfully
                </h3>
                <p className="text-green-700 mt-2">COD service has been completed!</p>
                <button
                  onClick={handleEarningsClick}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white flex items-center justify-center gap-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  <WalletCards className="w-5 h-5" />
                  Go to Earnings
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Online Payment Flow (WALLET/STRIPE) */}
        {(data.payment_method === "WALLET" || data.payment_method === "STRIPE") && (
          <div className="mt-8">
            {!isCompleted ? (
              <button
                onClick={handleMarkCompleted}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="inline mr-1" /> 
                {loading ? "Processing..." : "Complete Service"}
              </button>
            ) : (
              <div className="bg-green-100 border border-green-300 rounded-xl p-4 mt-4">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle /> Service Completed
                </h3>
                <p className="text-green-700">Service marked as completed successfully!</p>
                <button
                  onClick={handleEarningsClick}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white flex items-center justify-center gap-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  <WalletCards className="w-5 h-5" />
                  Go to Earnings
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Earnings Display */}
        {showEarnings && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 flex items-center gap-2 text-xl">
              <Coins /> Earnings
            </h3>
            <p className="text-green-700 text-lg mt-1">
              You have earned: <strong>₹{getEarningsAmount()}</strong>
            </p>
            {data.payment_method === "COD" && (
              <p className="text-sm text-gray-600 mt-2">
                Platform fee (₹{data.platform_fee}) has been automatically handled
              </p>
            )}
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="mt-6">
            <Message 
              message={notification} 
              icon={
                notification.includes("Failed") || notification.includes("Error") 
                  ? <AlertCircle className="inline mr-1 text-red-500" />
                  : <CheckCircle className="inline mr-1 text-green-500" />
              } 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceCompletePage;