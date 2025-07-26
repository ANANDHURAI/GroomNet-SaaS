import React, { useEffect, useState } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import Navbar from "../../components/basics/Navbar";
import { useNavigate } from "react-router-dom";

function FindBarbers() {
    const [status, setStatus] = useState("Searching for nearby barbers...");
    const [socket, setSocket] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [barberDetails, setBarberDetails] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const booking_id = urlParams.get('booking_id');
        console.log("Booking ID from URL:", booking_id);

        if (booking_id) {
            setBookingId(booking_id);

            const savedBarberDetails = sessionStorage.getItem(`barberDetails_${booking_id}`);
            const savedStatus = sessionStorage.getItem(`barberStatus_${booking_id}`);

            if (savedBarberDetails) {
                try {
                    setBarberDetails(JSON.parse(savedBarberDetails));
                    setStatus(savedStatus || "Barber found!");
                    setIsSearching(false);
                    return;
                } catch (error) {
                    console.error('Error parsing saved barber details:', error);
                    sessionStorage.removeItem(`barberDetails_${booking_id}`);
                    sessionStorage.removeItem(`barberStatus_${booking_id}`);
                }
            }

            startSearch(booking_id);
        } else {
            setStatus("No booking ID provided");
            setIsSearching(false);
        }

        return () => {
            if (socket) socket.close();
        };
    }, []);

    useEffect(() => {
        if (barberDetails && bookingId) {
            sessionStorage.setItem(`barberDetails_${bookingId}`, JSON.stringify(barberDetails));
            sessionStorage.setItem(`barberStatus_${bookingId}`, status);
        }
    }, [barberDetails, bookingId, status]);

    const startSearch = async (booking_id) => {
        setIsSearching(true);
        setStatus("Searching for nearby barbers...");

        try {
            const response = await apiClient.post(`/instant-booking/booking/${booking_id}/`);
            
            if (response.data.barbers_notified > 0) {
                setStatus(`Sent request to ${response.data.barbers_notified} barbers. Waiting for responses...`);
                initializeWebSocket(booking_id);
            } else {
                setStatus("No barbers available in your area.");
                setIsSearching(false);
            }

        } catch (error) {
            console.error("Error starting search:", error);
            if (error.response?.status === 404) {
                setStatus("No barbers available at the moment.");
            } else {
                setStatus("Error starting search. Please try again.");
            }
            setIsSearching(false);
        }
    };

    const initializeWebSocket = (booking_id) => {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            setStatus("Please login again.");
            setIsSearching(false);
            return;
        }

        const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
        const wsHost = window.location.hostname === "localhost"
            ? "localhost:8000"
            : window.location.host;
        const wsUrl = `${wsScheme}://${wsHost}/ws/instant-booking/${booking_id}/?token=${token}`;
        console.log("🔗 Connecting WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📨 WebSocket message:", data);

            if (data.type === "booking_accepted") {
                const barberData = data.barber_details;
                setBarberDetails({
                    name: barberData.name,
                    phone: barberData.phone,
                    profile_image: barberData.profile_image
                });
                setStatus(`${barberData.name} accepted your booking!`);
                setIsSearching(false);
            } else if (data.type === "no_barbers_available") {
                setStatus("No barbers available in your area.");
                setIsSearching(false);
            } else if (data.type === "booking_cancelled") {
                setStatus(`⌛ Booking cancelled: ${data.reason || 'Unknown reason'}`);
                setIsSearching(false);
            } else if (data.type === "remove_booking") {
                
                setStatus("Booking was processed by another barber.");
                setIsSearching(false);
            }
        };

        ws.onclose = (e) => {
            console.log("WebSocket disconnected", e);
            if (isSearching) {
                setTimeout(() => {
                    console.log("Reconnecting WebSocket...");
                    initializeWebSocket(booking_id);
                }, 3000);
            }
        };

        ws.onerror = (error) => {
            console.error(" WebSocket error:", error);
            setStatus("Connection error. Trying to reconnect...");
        };
    };

    const tryAgain = () => {
        if (bookingId) {
            sessionStorage.removeItem(`barberDetails_${bookingId}`);
            sessionStorage.removeItem(`barberStatus_${bookingId}`);
        }

        setBarberDetails(null);
        if (bookingId) {
            startSearch(bookingId);
        }
    };

    const cancelBooking = async () => {
        setStatus("Search cancelled");
        setIsSearching(false);
        if (socket) socket.close();

        if (bookingId) {
            sessionStorage.removeItem(`barberDetails_${bookingId}`);
            sessionStorage.removeItem(`barberStatus_${bookingId}`);
        }

        console.log("Booking cancelled");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Navbar />
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold">Find Barbers</h1>
                    <p className="text-gray-600 text-sm">Booking ID: {bookingId}</p>
                </div>

                {isSearching && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="text-gray-600 text-center">{status}</p>
                        <button
                            onClick={cancelBooking}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Cancel Search
                        </button>
                    </div>
                )}

                {barberDetails && (
                    <div className="flex flex-col items-center space-y-4">
                        <h2 className="text-lg font-semibold text-green-600">
                            Barber Found!
                        </h2>
                        <p className="text-gray-600 text-center">{status}</p>

                        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg w-full">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                {barberDetails.profile_image ? (
                                    <img
                                        src={barberDetails.profile_image}
                                        alt={barberDetails.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl">👨‍💼</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{barberDetails.name}</h3>
                                <p className="text-gray-600">{barberDetails.phone}</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2 w-full">
                            <button
                                onClick={() => window.location.href = `tel:${barberDetails.phone}`}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                📞 Call Barber
                            </button>
                            <button
                                onClick={() => navigate(`/booking-details/${bookingId}`)}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                📋 View Booking Details
                            </button>
                        </div>
                    </div>
                )}

                {!isSearching && !barberDetails && (
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-gray-600 text-center">{status}</p>
                        <button
                            onClick={tryAgain}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            🔄 Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindBarbers;