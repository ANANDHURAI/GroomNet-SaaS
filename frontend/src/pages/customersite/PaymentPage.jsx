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
  const [couponCode, setCouponCode] = useState("");
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
    const couponFromUrl = urlParams.get('coupon_code');

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

    if (couponFromUrl) {
      setCouponCode(couponFromUrl);
    }

    if (sessionBookingType === "SCHEDULE_BOOKING") {
      setMethod("STRIPE");
    }
  }, []);

  const handlePaymentMethod = async () => {
      setLoading(true);
      
      try {
        const payload = {
          service: bookingData.selectedServiceId,
          address: bookingData.selectedAddressId,
          payment_method: method,
          booking_type: bookingType, 
          coupon_code: couponCode
        };

        
        if (bookingType === "SCHEDULE_BOOKING") {
          payload.barber = bookingData.selectedBarberId;
          payload.slot = bookingData.selectedSlotId;
        }

       
        const res = await apiClient.post('/customersite/create-booking/', payload);
        const { booking_id } = res.data;
        
        
        sessionStorage.setItem('instantBookingId', booking_id);

      
        if (method === "STRIPE") {
          const sessionRes = await apiClient.post('/payment-service/create-checkout-session/', {
            booking_id: booking_id
          });
          const stripe = await loadStripe(sessionRes.data.stripe_public_key);
          await stripe.redirectToCheckout({ sessionId: sessionRes.data.sessionId });
        } 
        else {
        
          if (bookingType === "INSTANT_BOOKING") {
           
            navigate(`/find-barbers?booking_id=${booking_id}`);
          } else {
            
            navigate('/booking-success');
          }
        }

      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Booking failed");
      } finally {
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

          {couponCode && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Coupon Applied:</span> {couponCode}
              </p>
            </div>
          )}

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
            disabled={loading || !method || !hasAllData}
            className={`w-full py-3 rounded-lg font-bold transition duration-200 ${
              loading || !method || !hasAllData
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:from-pink-600 hover:to-yellow-600 shadow-md"
            }`}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center text-sm">
                {error}
              </p>
            </div>
          )}

          {!hasAllData && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center text-sm">
                Missing booking information. Please go back and complete all steps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;