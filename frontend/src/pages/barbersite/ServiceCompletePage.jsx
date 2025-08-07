import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import Message from "../../components/customercompo/booking/Message";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";
import {
  Phone, User, Home, Scissors, Gift, BadgeCheck, CircleCheck, HandCoins,
  AlertCircle, CheckCircle, Coins, WalletCards, ArrowRight, MapPin
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
    apiClient.get(`/instant-booking/complete/service/${bookingId}/`)
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
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'collect_cod' })
      .then(() => {
        setIsCollected(true);
        setNotification("Amount collected successfully!");
        setTimeout(() => setNotification(""), 5000);
      })
      .catch((error) => {
        setNotification("Failed to record collection");
        setTimeout(() => setNotification(""), 3000);
      })
      .finally(() => setLoading(false));
  };

  const handleMarkCompleted = () => {
    setLoading(true);
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'complete_service' })
      .then(() => {
        setIsCompleted(true);
        setShowEarnings(true);
        setNotification("Service completed successfully!");
        setTimeout(() => setNotification(""), 5000);
        fetchServiceDetails();
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || "Failed to complete service";
        setNotification(errorMessage);
        setTimeout(() => setNotification(""), 5000);
      })
      .finally(() => setLoading(false));
  };

  const getCODAmount = () => parseFloat(data?.price || 0);
  const getEarnings = () => {
    const finalAmount = parseFloat(data?.price || 0);
    const platformFee = parseFloat(data?.platform_fee || 0);
    return (finalAmount - platformFee).toFixed(2);
  };

  if (!data) {
    return (
      <div className="flex">
        <BarberSidebar />
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-72 fixed left-0 top-0 h-full bg-white shadow-md z-10"> 
        <BarberSidebar />
      </div>
      <div className="flex-1 ml-72 p-6"> 
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck size={32} />
              <h1 className="text-2xl font-bold leading-snug">Service Completion</h1>
            </div>
            <p className="opacity-90 text-sm md:text-base">Complete your service and manage payments</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Gift className="text-blue-500" size={20} />
                    Booking Details
                  </h2>
                </div>
                <div className="px-6 py-5 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{data.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{data.customer_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Scissors className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium">{data.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Coins className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">₹{data.price}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Service Address</p>
                        <p className="text-gray-700">{data.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {data.payment_method === "COD" ? (
                <div className="space-y-4">
                  {!isCollected && !isCompleted && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <HandCoins className="text-amber-600" size={24} />
                        <h3 className="text-lg font-semibold text-amber-800">Collect Payment</h3>
                      </div>
                      <p className="text-amber-700 mb-1">Total amount to collect: <span className="font-bold text-xl">₹{data.price}</span></p>
                      <p className="text-sm text-amber-600 mb-4">Final amount after discount (includes platform fee)</p>
                      <button onClick={handleCollectAmount} disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50">
                        {loading ? "Processing..." : "✓ Mark as Collected"}
                      </button>
                    </div>
                  )}
                  {isCollected && !isCompleted && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CircleCheck className="text-blue-600" size={24} />
                        <h3 className="text-lg font-semibold text-blue-800">Ready to Complete</h3>
                      </div>
                      <p className="text-blue-700 mb-4">Payment collected successfully. Complete the service now.</p>
                      <button onClick={handleMarkCompleted} disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50">
                        {loading ? "Processing..." : "Complete Service"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !isCompleted && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="text-blue-600" size={24} />
                      <h3 className="text-lg font-semibold text-blue-800">Complete Service</h3>
                    </div>
                    <p className="text-blue-700 mb-4">Payment already processed. Mark service as completed.</p>
                    <button onClick={handleMarkCompleted} disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50">
                      {loading ? "Processing..." : "Complete Service"}
                    </button>
                  </div>
                )
              )}

              {isCompleted && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 relative overflow-hidden animate-crack">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="text-green-600" size={24} />
                      <h3 className="text-lg font-semibold text-green-800">Service Completed!</h3>
                    </div>
                    <p className="text-green-700 mb-4">Great job! The service has been completed successfully.</p>
                    <button onClick={() => navigate("/barber-earnings")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2">
                      <WalletCards size={20} />
                      View Earnings
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Payment Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.payment_method === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {data.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.payment_done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {data.payment_done ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {showEarnings && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Coins size={24} />
                    <h3 className="font-semibold text-lg">Your Earnings</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">₹{getEarnings()}</p>
                  <p className="text-green-100 text-sm">Added to your wallet</p>
                </div>
              )}
            </div>
          </div>

          {notification && (
            <div className="fixed top-4 right-4 z-50 max-w-sm">
              <Message
                message={notification}
                icon={notification.includes("Failed") ?
                  <AlertCircle className="text-red-500" size={20} /> :
                  <CheckCircle className="text-green-500" size={20} />
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceCompletePage;
