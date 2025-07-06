import React, { useEffect, useState } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import Navbar from "../../components/basics/Navbar";

function FindBarbers() {
    const [status, setStatus] = useState("Searching for nearby barbers...");
    const [socket, setSocket] = useState(null);
    const [barberDetails, setBarberDetails] = useState(() => {
        const saved = sessionStorage.getItem("accepted_barber");
        return saved ? JSON.parse(saved) : null;
    });
    const [isSearching, setIsSearching] = useState(!barberDetails);
    const [barberProfile, setBarberProfile] = useState(null);

    const bookingType = sessionStorage.getItem('bookingType') || 'instant';

    useEffect(() => {
        if (!barberDetails) {
            startSearch();
        } else {
            fetchBarberProfile(barberDetails.barber_id);
        }
        return () => {
            if (socket) socket.close();
        };
    }, []);

    const fetchBarberProfile = async (barberId) => {
        try {
            const response = await apiClient.get(`/profile-service/user-profile/${barberId}/`);
            setBarberProfile(response.data);
        } catch (error) {
            console.error("Error fetching barber profile:", error);
        }
    };

    const startSearch = async () => {
        setIsSearching(true);
        setStatus("Searching for nearby barbers...");

        try {
            initializeWebSocket();

            const urlParams = new URLSearchParams(window.location.search);
            const serviceId = urlParams.get('service_id');

            if (!serviceId) {
                setStatus("Missing service information. Please try again.");
                setIsSearching(false);
                return;
            }

            const response = await apiClient.post("/instant-booking/find-nearby-barbers/", {
                service_id: serviceId
            });

            setStatus(`Found ${response.data.barbers_found} barbers. Waiting for acceptance...`);
        } catch (error) {
            console.error("Error finding barbers:", error);
            if (error.response?.status === 404) {
                setStatus("No barbers available for this service right now.");
            } else {
                setStatus("Error searching for barbers. Please try again.");
            }
            setIsSearching(false);
        }
    };

    const initializeWebSocket = () => {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            setStatus("Authentication required. Please login again.");
            return;
        }

        const wsUrl = `ws://localhost:8000/ws/instant-booking/?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket message:", data);

            if (data.type === "booking_accepted") {
                const barberData = {
                    barber_name: data.barber_name,
                    barber_phone: data.barber_phone,
                    barber_id: data.barber_id,
                    barber_profile_image: data.barber_profile_image,
                    service_id: data.service_id,
                    service_name: data.service_name,
                    service_price: data.service_price,
                };
                setBarberDetails(barberData);
                sessionStorage.setItem("accepted_barber", JSON.stringify(barberData));
                setStatus(`${data.barber_name} accepted your request!`);
                setIsSearching(false);
                
                // Fetch barber profile for additional details
                fetchBarberProfile(data.barber_id);
            } else if (data.type === "no_barbers_available") {
                setStatus("Sorry, no barbers are available right now.");
                setIsSearching(false);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            if (isSearching) {
                setTimeout(() => {
                    initializeWebSocket();
                }, 3000);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    };

    const proceedToBooking = () => {
        if (!barberDetails) return;

        const urlParams = new URLSearchParams(window.location.search);
        const bookingParams = {
            service_id: barberDetails.service_id,
            barber_id: barberDetails.barber_id,
            address_id: urlParams.get('address_id'),
        };

        if (bookingType === 'instant') {
            bookingParams.booking_type = 'INSTANT_BOOKING';
        } else if (bookingType === 'schedule') {
            bookingParams.booking_type = 'SCHEDULED_BOOKING';
        }

        const queryString = new URLSearchParams(bookingParams).toString();
        window.location.href = `/confirm-booking?${queryString}`;
    };

    const tryAgain = () => {
        setBarberDetails(null);
        setBarberProfile(null);
        sessionStorage.removeItem("accepted_barber");
        startSearch();
    };

    // Get display status
    const getStatusInfo = () => {
        if (barberDetails) {
            return { emoji: "🎉", color: "text-green-600", message: "Barber Found!" };
        }
        if (isSearching) {
            return { emoji: "🔍", color: "text-blue-600", message: status };
        }
        if (status.includes("Sorry") || status.includes("Error")) {
            return { emoji: "😔", color: "text-red-600", message: status };
        }
        return { emoji: "⏳", color: "text-gray-600", message: status };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-20 px-4 max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    {/* Status Section */}
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-3">{statusInfo.emoji}</div>
                        <h2 className={`text-lg font-semibold ${statusInfo.color}`}>
                            {statusInfo.message}
                        </h2>
                        {isSearching && (
                            <div className="mt-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                            </div>
                        )}
                    </div>

                    {/* Barber Details */}
                    {barberDetails && (
                        <div className="mb-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                                    {barberDetails.barber_profile_image || barberProfile?.profileimage ? (
                                        <img 
                                            src={barberDetails.barber_profile_image || barberProfile?.profileimage} 
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
                                    {barberProfile?.gender && (
                                        <p className="text-sm text-gray-500 capitalize">{barberProfile.gender}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <h4 className="font-medium mb-2">Service Details</h4>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{barberDetails.service_name}</span>
                                    <span className="font-semibold text-green-600">₹{barberDetails.service_price}</span>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    💡 Payment after service completion
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {barberDetails && (
                            <button
                                onClick={proceedToBooking}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                            >
                                Continue to Book
                            </button>
                        )}
                        
                        {!isSearching && !barberDetails && (
                            <button
                                onClick={tryAgain}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FindBarbers;