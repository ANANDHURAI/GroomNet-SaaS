import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import Message from "../../components/customercompo/booking/Message";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";

function ServiceCompletePage() {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [notification, setNotification] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    apiClient
      .get(`/instant-booking/complete/service/${bookingId}/`)
      .then((response) => {
        setData(response.data);
        if (response.data.payment_done) {
          setIsCompleted(response.data.status === "COMPLETED");
          if (response.data.payment_method === 'COD' && response.data.payment_done) {
            setIsCollected(true);
          }
          if (response.data.status === 'COMPLETED') {
            setShowEarnings(true);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching service details:", error);
      });
  }, [bookingId]);

  useEffect(() => {
  
    const token = localStorage.getItem("access_token"); 
    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.host
      }/ws/instant-booking/${bookingId}/?token=${token}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected ✅");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);

      if (data.type === "service_completed") {
        setNotification(data.message);
        setTimeout(() => setNotification(""), 5000);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected ❌");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [bookingId]);

  const handleCollectAmount = () => {
    setIsCollected(true);
    setNotification("💰 Amount collected from customer!");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleMarkCompleted = () => {
    apiClient
      .post(`/instant-booking/complete/service/${bookingId}/`, {
        action: "service_completed",
      })
      .then((response) => {
        console.log(response.data);
        setIsCompleted(true);
        setShowEarnings(true);
        setNotification("🎉 Service marked as completed!");
        setTimeout(() => setNotification(""), 5000);
      })
      .catch((error) => {
        console.error("Error completing service:", error);
        setNotification("❌ Failed to mark as completed");
        setTimeout(() => setNotification(""), 3000);
      });
  };

  const getEarningsAmount = () => {
    if (data?.payment_method === "COD") {
      return data.service_amount;
    }
    return data?.service_amount || data?.price;
  };

  const getCODCollectionAmount = () => {
    return (
      parseFloat(data?.service_amount || 0) +
      parseFloat(data?.platform_fee || 0)
    );
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading service details...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <BarberSidebar />
      <div className="flex-1 max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-green-700">
          🎉 Service Completion
        </h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Booking ID:</strong> {data.id}
          </p>
          <p>
            <strong>Customer:</strong> {data.customer_name}
          </p>
          <p>
            <strong>Phone:</strong> {data.customer_phone}
          </p>
          <p>
            <strong>Address:</strong> {data.address}
          </p>
          <p>
            <strong>Service:</strong> {data.service}
          </p>
          <p>
            <strong>Total Price:</strong> ₹{data.price}
          </p>
          <p>
            <strong>Booking Type:</strong> {data.booking_type}
          </p>
          <p>
            <strong>Payment Method:</strong> {data.payment_method}
          </p>
        </div>

        {data.payment_method === "COD" && (
          <div className="mt-6 space-y-4">
            {!isCollected && !isCompleted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  💰 Collect Amount from Customer
                </h3>
                <p className="text-yellow-700 mb-3">
                  Amount to collect:{" "}
                  <strong>₹{getCODCollectionAmount()}</strong>
                  <br />
                  <small className="text-gray-600">
                    (Service: ₹{data.service_amount} + Platform Fee: ₹
                    {data.platform_fee})
                  </small>
                </p>
                <button
                  onClick={handleCollectAmount}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  💰 Collected
                </button>
              </div>
            )}

            {isCollected && !isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✅ Amount Collected
                </h3>
                <p className="text-green-700 mb-3">
                  Ready to complete the service
                </p>
                <button
                  onClick={handleMarkCompleted}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✅ Complete Service
                </button>
              </div>
            )}
          </div>
        )}

        {(data.payment_method === "WALLET" ||
          data.payment_method === "STRIPE") && (
          <div className="mt-6">
            {!isCompleted ? (
              <button
                onClick={handleMarkCompleted}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ✅ Complete Service
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  ✅ Service Completed
                </h3>
                <p className="text-green-700">
                  Service has been marked as completed successfully!
                </p>
              </div>
            )}
          </div>
        )}

        {showEarnings && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-green-700 text-lg">
              You have earned: <strong>₹{getEarningsAmount()}</strong>
            </p>
            {data.payment_method === "COD" && (
              <p className="text-sm text-gray-600 mt-2">
                Please deposit ₹{data.platform_fee} platform fee manually
              </p>
            )}
          </div>
        )}

        {notification && <Message message={notification} />}
      </div>
    </div>
  );
}

export default ServiceCompletePage;
