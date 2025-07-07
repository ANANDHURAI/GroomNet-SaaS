import React, { useEffect, useState } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import Navbar from "../../components/basics/Navbar";

function FindBarbers() {
    const [status, setStatus] = useState("Searching for nearby barbers...");
    const [socket, setSocket] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [barberDetails, setBarberDetails] = useState(null);
    const [bookingId, setBookingId] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const booking_id = urlParams.get('booking_id');
        console.log("booking_id from URL:", booking_id);

        if (booking_id) {
            setBookingId(booking_id);
            startSearch(booking_id);
        } else {
            setStatus("No booking ID provided");
            setIsSearching(false);
        }

        return () => {
            if (socket) socket.close();
        };
    }, []);


    const startSearch = async (booking_id) => {
        setIsSearching(true);
        setStatus("Searching for nearby barbers...");

        try {
            const statusResponse = await apiClient.get(`/instant-booking/booking/${booking_id}/status/`);
            
            if (statusResponse.data.barber_assigned) {
                setBarberDetails(statusResponse.data.barber_details);
                setStatus(`${statusResponse.data.barber_details.name} is your barber!`);
                setIsSearching(false);
                return;
            }

            initializeWebSocket(booking_id);

        } catch (error) {
            console.error("Error starting search:", error);
            setStatus("Error starting search. Please try again.");
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
        console.log("🔗 Connecting to WebSocket:", wsUrl);

        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📨 WebSocket message:", data);

            if (data.booking_confirmed) {
                const barberData = {
                    barber_name: data.barber_name,
                    barber_phone: data.barber_phone,
                    barber_profile_image: data.barber_profile,
                };
                setBarberDetails(barberData);
                setStatus(`${data.barber_name} accepted your request!`);
                setIsSearching(false);
            } else if (data.no_barbers) {
                setStatus("No barbers available in your area.");
                setIsSearching(false);
            } else if (data.booking_expired) {
                setStatus("Request expired. No barber accepted in time.");
                setIsSearching(false);
            } else if (data.barbers_count) {
                setStatus(`Found ${data.barbers_count} barbers. Waiting for acceptance...`);
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
            console.error("WebSocket error:", error);
            setStatus("Connection error. Trying to reconnect...");
        };
    };


    const tryAgain = () => {
        setBarberDetails(null);
        if (bookingId) {
            startSearch(bookingId);
        }
    };

    const cancelBooking = async () => {
        setStatus("Search cancelled");
        setIsSearching(false);
        if (socket) socket.close();
        console.log("Booking cancelled");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Navbar/>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold">Find Barbers</h1>
                    <p className="text-gray-600 text-sm">Booking ID: {bookingId}</p>
                </div>
                {isSearching && (
                    <div className="text-center mb-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 mb-4">{status}</p>
                        <button
                            onClick={cancelBooking}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Cancel Search
                        </button>
                    </div>
                )}

                {barberDetails && (
                    <div className="mb-6">
                        <div className="text-center mb-4">
                            <h2 className="text-lg font-semibold text-green-600 mb-2">
                                Barber Found!
                            </h2>
                            <p className="text-gray-600">{status}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-4 p-4 bg-green-50 rounded-lg">
                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                                {barberDetails.barber_profile_image ? (
                                    <img 
                                        src={barberDetails.barber_profile_image} 
                                        alt={barberDetails.barber_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                        👨‍💼
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{barberDetails.barber_name}</h3>
                                <p className="text-gray-600">{barberDetails.barber_phone}</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => window.location.href = `tel:${barberDetails.barber_phone}`}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Call Barber
                            </button>
                            <button
                                onClick={() => alert('View booking details clicked!')}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                 View Booking Details
                            </button>
                        </div>
                    </div>
                )}

                {!isSearching && !barberDetails && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">{status}</p>
                        <button
                            onClick={tryAgain}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindBarbers;
