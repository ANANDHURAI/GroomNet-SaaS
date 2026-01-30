import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserCircle, Frown } from "lucide-react";

function FindBarbers() {
  const [status, setStatus] = useState("Broadcasting to nearby barbers...");
  const [barberDetails, setBarberDetails] = useState(null);
  const [isSearching, setIsSearching] = useState(true);
  const [bookingExpired, setBookingExpired] = useState(false);
  
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookingId) {
      navigate("/");
      return;
    }

    const triggerSearch = async () => {
      try {
        await apiClient.post(`/instant-booking/bookings/${bookingId}/find-barber/`);
        console.log("Search broadcasted.");
      } catch (err) {
        console.error("Failed to notify barbers", err);
      }
    };
    triggerSearch();

    const handleAccepted = (event) => {
        const data = event.detail;
        console.log("Booking Accepted Event:", data);
        if (String(data.booking_id) === String(bookingId)) {
            clearTimeout(timerRef.current);
            setBarberDetails(data.barber_details);
            setStatus("Barber Found!");
            setIsSearching(false);
        }
    };

    const handleCancelled = (event) => {
        const data = event.detail;
        if (String(data.booking_id) === String(bookingId) || !data.booking_id) {
            handleExpiration();
        }
    };

    window.addEventListener("booking_accepted", handleAccepted);
    window.addEventListener("booking_cancelled", handleCancelled);

    timerRef.current = setTimeout(() => {
      expireBooking();
    }, 120000); 

    return () => {
      window.removeEventListener("booking_accepted", handleAccepted);
      window.removeEventListener("booking_cancelled", handleCancelled);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [bookingId, navigate]);

  const expireBooking = async () => {
    try {
      await apiClient.post(`/instant-booking/bookings/${bookingId}/expire/`);
      handleExpiration();
    } catch (err) {
      console.error("Error expiring booking", err);
    }
  };

  const handleExpiration = () => {
    setBookingExpired(true);
    setIsSearching(false);
    setStatus("No barbers accepted your request.");
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          
          {isSearching && (
            <div className="space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <h2 className="text-2xl font-bold text-gray-800">{status}</h2>
              <p className="text-gray-500">Please wait while we connect you...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '100%', transition: 'width 120s linear'}}></div>
              </div>
            </div>
          )}

          {!isSearching && barberDetails && (
            <div className="space-y-6">
               <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                 <UserCircle className="w-10 h-10 text-green-600" />
               </div>
               <h2 className="text-2xl font-bold text-gray-800">{barberDetails.name} is coming!</h2>
               <p className="text-lg text-gray-600">Phone: {barberDetails.phone}</p>
               <button onClick={() => navigate(`/booking-details/${bookingId}`)} className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4 shadow-lg hover:bg-blue-700 transition">
                 View Tracking
               </button>
            </div>
          )}

          {!isSearching && bookingExpired && (
            <div className="space-y-4">
              <Frown className="w-16 h-16 text-gray-400 mx-auto" />
              <h2 className="text-xl font-bold text-gray-800">Booking Cancelled</h2>
              <p className="text-gray-600">We couldn't find a barber nearby. Your payment has been refunded.</p>
              <button onClick={() => navigate('/home')} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition">
                Go Home
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default FindBarbers;