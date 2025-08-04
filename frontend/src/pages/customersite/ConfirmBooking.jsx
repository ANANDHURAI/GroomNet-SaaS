import { useState, useEffect } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import { ArrowLeft, Check, Scissors, User, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import Navbar from "../../components/basics/Navbar";

export const ConfirmBooking = () => {
  const [bookingSummary, setBookingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [bookingType, setBookingType] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeFromSession = sessionStorage.getItem("bookingType");
    const normalizedType = (typeFromSession || "SCHEDULE_BOOKING").toUpperCase();
    setBookingType(normalizedType);

    const currentBookingData = {
      service_id: urlParams.get("service_id"),
      barber_id: urlParams.get("barber_id"),
      slot_id: urlParams.get("slot_id"),
      address_id: urlParams.get("address_id"),
    };

    setBookingData(currentBookingData);

    if (
      !currentBookingData.service_id ||
      !currentBookingData.address_id ||
      (normalizedType !== "INSTANT_BOOKING" && (!currentBookingData.barber_id || !currentBookingData.slot_id))
    ) {
      setError("Missing booking information. Please start from the beginning.");
      setLoading(false);
      return;
    }

    fetchBookingSummary(currentBookingData, normalizedType);
  }, []);

  const fetchBookingSummary = async (data, type, coupon = "") => {
    try {
      setLoading(true);
      
      // Only clear coupon error if we're not applying a coupon
      if (!coupon) {
        setCouponError(null);
      }

      const payload = {
        service_id: data.service_id,
        address_id: data.address_id,
      };

      if (type !== "INSTANT_BOOKING") {
        payload.barber_id = data.barber_id;
        payload.slot_id = data.slot_id;
      }

      if (coupon && coupon.trim()) {
        payload.coupon_code = coupon.trim();
      }

      console.log('Fetching booking summary with payload:', payload);

      const response = await apiClient.post("/customersite/booking-summary/", payload);
      
      console.log('Booking summary response:', response.data);
      
      setBookingSummary(response.data);
      
      // Clear coupon error on successful response
      setCouponError(null);
      
    } catch (error) {
      console.error('Booking summary error:', error);
      
      if (error.response?.data?.error) {
        if (coupon && coupon.trim()) {
          // If we were applying a coupon and got an error, show coupon error
          setCouponError(error.response.data.error);
          // Don't update loading state, keep the previous summary if it exists
        } else {
          // If it's not a coupon-related error, show general error
          setError(error.response.data.error);
        }
      } else {
        setError("Failed to load booking details. Please try again.");
      }
    } finally {
      setLoading(false);
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);
    fetchBookingSummary(bookingData, bookingType, couponCode);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponError(null);
    fetchBookingSummary(bookingData, bookingType, "");
  };

  const handleConfirmBooking = async () => {
    try {
      setConfirming(true);

      const paymentUrl = new URL("/payment", window.location.origin);
      paymentUrl.searchParams.set("service_id", bookingData.service_id);
      paymentUrl.searchParams.set("address_id", bookingData.address_id);
      
      if (bookingType !== "INSTANT_BOOKING") {
        paymentUrl.searchParams.set("barber_id", bookingData.barber_id);
        paymentUrl.searchParams.set("slot_id", bookingData.slot_id);
      }

      // Add coupon code to URL if applied successfully
      if (bookingSummary?.coupon?.code) {
        paymentUrl.searchParams.set("coupon_code", bookingSummary.coupon.code);
      }

      window.location.href = paymentUrl.toString();
    } catch (error) {
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const handleBack = () => window.history.back();

  if (loading && !bookingSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (!bookingSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No booking data</h2>
          <p className="text-gray-600 mb-4">Unable to load booking information.</p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Confirm Booking</h1>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <p className="text-lg text-gray-600">Review your appointment details</p>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-md space-y-6">
          {/* Service Details */}
          <div className="flex items-center space-x-4 border-b pb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Scissors className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{bookingSummary.service.name}</h3>
              <p className="text-sm text-gray-600">{bookingSummary.service.duration} minutes</p>
            </div>
            <p className="font-semibold text-green-600 whitespace-nowrap">₹{bookingSummary.service.price}</p>
          </div>

          {/* Barber and Slot Details (for scheduled bookings) */}
          {bookingType !== "INSTANT_BOOKING" && bookingSummary.barber && bookingSummary.slot && (
            <>
              <div className="flex items-center space-x-4 border-b pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{bookingSummary.barber.name}</h3>
                  <p className="text-sm text-gray-600">Professional Barber</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 border-b pb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{bookingSummary.slot.date}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {bookingSummary.slot.start_time} - {bookingSummary.slot.end_time}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Address Details */}
          <div className="flex items-start space-x-4 border-b pb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Service Address</h3>
              <p className="text-sm text-gray-600 mb-2">{bookingSummary.address.full_address}</p>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-1" />
                {bookingSummary.address.mobile}
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-3 border-b pb-4">
            <label className="text-sm font-medium text-gray-700">Apply Coupon Code</label>
            
            {/* Show applied coupon if exists */}
            {bookingSummary.coupon && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Coupon Applied: {bookingSummary.coupon.code}
                    </p>
                    <p className="text-xs text-green-600">
                      {bookingSummary.coupon.discount_percentage}% discount - Save ₹{bookingSummary.discount}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Coupon input */}
            {!bookingSummary.coupon && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter coupon code"
                  disabled={couponLoading}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>
            )}

            {/* Coupon error */}
            {couponError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{couponError}</p>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Service Price</span>
              <span>₹{bookingSummary.service_amount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Platform Fee (5%)</span>
              <span>₹{bookingSummary.platform_fee}</span>
            </div>
            {bookingSummary.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount ({bookingSummary.coupon?.code})</span>
                <span>-₹{bookingSummary.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-3">
              <span>Total Amount</span>
              <span>₹{bookingSummary.total_amount}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirmBooking}
          disabled={confirming}
          className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming ? "Processing..." : "Confirm & Proceed to Payment"}
        </button>
      </div>
    </div>
  );
};