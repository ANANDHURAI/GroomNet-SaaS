import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';
import { loadStripe } from '@stripe/stripe-js';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';

function PaymentPage() {
  const [method, setMethod] = useState("COD");
  const [bookingType, setBookingType] = useState(""); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    selectedServiceId: null,
    selectedBarberId: null,
    selectedSlotId: null,
    selectedAddressId: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service_id');
    const barberId = urlParams.get('barber_id');
    const slotId = urlParams.get('slot_id');
    const addressId = urlParams.get('address_id');

    const sessionBookingType = sessionStorage.getItem('bookingType');
    setBookingType(sessionBookingType);

    if (!serviceId || !addressId) {
      setError('Missing booking information. Please start from the beginning.');
      return;
    }

    setBookingData({
      selectedServiceId: parseInt(serviceId),
      selectedBarberId: barberId ? parseInt(barberId) : null,
      selectedSlotId: slotId ? parseInt(slotId) : null,
      selectedAddressId: parseInt(addressId)
    });

    if (sessionBookingType === "SCHEDULE_BOOKING") {
      setMethod("STRIPE");
    }
  }, []);

  const handlePaymentMethod = async () => {
    setLoading(true);
    setError(null);

    if (!bookingData.selectedServiceId || !bookingData.selectedAddressId) {
      setError("Missing required booking information. Please go back and complete all steps.");
      setLoading(false);
      return;
    }

    try {
      const bookingRes = await apiClient.post('/customersite/create-booking/', {
        service: bookingData.selectedServiceId,
        barber: bookingData.selectedBarberId,
        slot: bookingData.selectedSlotId,
        address: bookingData.selectedAddressId,
        payment_method: method,
        booking_type: bookingType
      });

      const bookingId = bookingRes.data.booking_id;
      sessionStorage.setItem('instantBookingId', bookingId);

      if (method === "COD" || method === "WALLET") {
      
        setTimeout(() => {
          navigate('/booking-success');
        }, 2000);
        return;
      }

      const stripeSessionRes = await apiClient.post('/payment-service/create-checkout-session/', {
        booking_id: bookingId
      });

      const { sessionId, stripe_public_key } = stripeSessionRes.data;
      const stripe = await loadStripe(stripe_public_key);
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Booking error:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Something went wrong while booking.");
      }
      setLoading(false);
    }
  };

  const hasAllData = bookingData.selectedServiceId && bookingData.selectedAddressId;

  if (loading && (method === "COD" || method === "WALLET")) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner 
            size="large" 
            text={method === "COD" 
              ? "Confirming Cash Payment..." 
              : "Processing Wallet Payment..."} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Choose Payment Method
          </h2>

          <div className="space-y-3 mb-6">
            {bookingType === "INSTANT_BOOKING" && (
              <>
                <button
                  onClick={() => setMethod("COD")}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                    method === "COD"
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                  disabled={loading}
                >
                  Cash on Delivery
                </button>

                <button
                  onClick={() => setMethod("STRIPE")}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                    method === "STRIPE"
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                  disabled={loading}
                >
                  Stripe
                </button>

                <button
                  onClick={() => setMethod("WALLET")}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                    method === "WALLET"
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                  disabled={loading}
                >
                  Wallet
                </button>
              </>
            )}

            {bookingType === "SCHEDULE_BOOKING" && (
              <>
                <button
                  onClick={() => setMethod("STRIPE")}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                    method === "STRIPE"
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                  disabled={loading}
                >
                  Stripe
                </button>

                <button
                  onClick={() => setMethod("WALLET")}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
                    method === "WALLET"
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                  disabled={loading}
                >
                  Wallet
                </button>
              </>
            )}
          </div>

          <button
            onClick={handlePaymentMethod}
            disabled={loading || !method}
            className={`w-full py-3 rounded-lg font-bold transition duration-200 ${
              loading || !method
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:from-pink-600 hover:to-yellow-600 shadow-md"
            }`}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>

          {error && (
            <p className="text-red-600 text-center text-sm mt-4">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;