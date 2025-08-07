import React, { useEffect, useState } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import Navbar from "../../components/basics/Navbar";
import { useNavigate } from "react-router-dom";
import {
    Scissors,
    PartyPopper,
    UserCircle,
    Check,
    Phone,
    ClipboardList,
    Frown
} from "lucide-react";

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
        const wsHost = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;
        const wsUrl = `${wsScheme}://${wsHost}/ws/instant-booking/${booking_id}/?token=${token}`;
        console.log("Connecting WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => console.log("WebSocket connected");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
           

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
                setStatus(`Booking cancelled: ${data.reason || 'Unknown reason'}`);
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
        if (bookingId) startSearch(bookingId);
    };

    const cancelBooking = async () => {
        setStatus("Search cancelled");
        setIsSearching(false);
        if (socket) socket.close();
        if (bookingId) {
            sessionStorage.removeItem(`barberDetails_${bookingId}`);
            sessionStorage.removeItem(`barberStatus_${bookingId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Navbar />

            <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Scissors className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Find Your Barber</h1>
                        <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">
                            <p className="text-white text-sm font-medium">ID: {bookingId}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {isSearching && (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping delay-150"></div>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping delay-300"></div>
                                </div>

                                <p className="text-gray-700 font-medium">{status}</p>

                                <button
                                    onClick={cancelBooking}
                                    className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
                                >
                                    Cancel Search
                                </button>
                            </div>
                        )}

                        {barberDetails && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <PartyPopper className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-green-600 mb-2">Barber Found!</h2>
                                    <p className="text-gray-600">{status}</p>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center ring-4 ring-white shadow-lg">
                                                {barberDetails.profile_image ? (
                                                    <img
                                                        src={barberDetails.profile_image}
                                                        alt={barberDetails.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserCircle className="w-8 h-8 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800">{barberDetails.name}</h3>
                                            <p className="text-gray-600 font-medium">{barberDetails.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.href = `tel:${barberDetails.phone}`}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 flex items-center justify-center space-x-2"
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span>Call Barber</span>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/booking-details/${bookingId}`)}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200 flex items-center justify-center space-x-2"
                                    >
                                        <ClipboardList className="w-5 h-5" />
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isSearching && !barberDetails && (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center">
                                    <Frown className="w-8 h-8 text-orange-600" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-700">Oops!</h3>
                                    <p className="text-gray-600">{status}</p>
                                </div>
                                <button
                                    onClick={tryAgain}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200 flex items-center justify-center space-x-2"
                                >
                                    <PartyPopper className="w-5 h-5" />
                                    <span>Try Again</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FindBarbers;
