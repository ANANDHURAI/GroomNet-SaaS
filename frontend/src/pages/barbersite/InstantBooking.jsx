import React, { useEffect, useState } from "react";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";
import apiClient from "../../slices/api/apiIntercepters";

function InstantBooking() {
    const [incomingRequest, setIncomingRequest] = useState(() => {
        const saved = sessionStorage.getItem("accepted_booking");
        return saved ? JSON.parse(saved) : null;
    });
    const [socket, setSocket] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");

    useEffect(() => {
        fetchOnlineStatus();
        initializeWebSocket();

        return () => {
            if (socket) socket.close();
        };
    }, []);

    const fetchOnlineStatus = async () => {
        try {
            const response = await apiClient.get('/instant-booking/barber-online-status/');
            setIsOnline(response.data.is_online);
        } catch (error) {
            console.error('Error fetching online status:', error);
        }
    };

    const initializeWebSocket = () => {
        const token = sessionStorage.getItem('access_token');
        const wsUrl = `ws://localhost:8000/ws/instant-booking/?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("Barber WebSocket connected");
            setConnectionStatus("Connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket message:", data);

            if (data.type === "new_booking_request") {
                if (!sessionStorage.getItem("accepted_booking")) {
                    setIncomingRequest(data);
                }
            } else if (data.type === "online_status_updated") {
                setIsOnline(data.is_online);
            } else if (data.type === "booking_confirmed") {
                const bookingData = {
                    ...incomingRequest,
                    accepted: true,
                    timestamp: new Date().toISOString()
                };
                sessionStorage.setItem("accepted_booking", JSON.stringify(bookingData));
                setIncomingRequest(bookingData);
                alert("Booking accepted successfully!");
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setConnectionStatus("Disconnected");
            setTimeout(() => {
                initializeWebSocket();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setConnectionStatus("Error");
        };

        setSocket(ws);
    };

    const handleToggleOnline = async () => {
        if (isOnline && incomingRequest?.accepted) {
            alert("Cannot go offline while you have an accepted booking. Please complete the service first.");
            return;
        }
        
        const newStatus = !isOnline;
        try {
            const response = await apiClient.post('/instant-booking/barber-online-status/', {
                is_online: newStatus
            });

            if (response.status === 200) {
                setIsOnline(newStatus);

                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        action: "toggle_online",
                        is_online: newStatus
                    }));
                }
            }
        } catch (error) {
            console.error('Error updating online status:', error);
        }
    };

    const handleAcceptBooking = () => {
        if (socket && socket.readyState === WebSocket.OPEN && incomingRequest) {
            socket.send(JSON.stringify({
                action: "accept_booking",
                customer_id: incomingRequest.customer_id,
                service_id: incomingRequest.service_id,
            }));
            
            const bookingData = {
                ...incomingRequest,
                accepted: true,
                timestamp: new Date().toISOString()
            };
            sessionStorage.setItem("accepted_booking", JSON.stringify(bookingData));
            setIncomingRequest(bookingData);
        }
    };

    const handleRejectBooking = () => {
        if (socket && socket.readyState === WebSocket.OPEN && incomingRequest) {
            socket.send(JSON.stringify({
                action: "reject_booking",
                customer_id: incomingRequest.customer_id,
                service_id: incomingRequest.service_id,
            }));
            setIncomingRequest(null);
            sessionStorage.removeItem("accepted_booking");
        }
    };

    const handleCompleteBooking = () => {
        setIncomingRequest(null);
        sessionStorage.removeItem("accepted_booking");
        alert("Booking completed successfully!");
    };

    const getCustomerImage = () => {
        if (incomingRequest?.customer_profile_image) {
            return incomingRequest.customer_profile_image;
        }
        
        return "https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=User";
    };

    return (
        <div className="flex">
        
            <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white">
                <BarberSidebar />
            </div>

           
            <div className="flex-1 ml-64 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Instant Booking Dashboard</h1>

            
                    <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-gray-600">Connection Status: </span>
                                <span className={`font-semibold ${
                                    connectionStatus === "Connected" ? "text-green-600" : 
                                    connectionStatus === "Disconnected" ? "text-red-600" : "text-yellow-600"
                                }`}>
                                    {connectionStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Availability Status</h3>
                                <p className="text-gray-600">
                                    Turn on to receive instant booking requests from customers
                                </p>
                            </div>
                            <div className="flex items-center">
                                <span className={`mr-3 font-semibold ${
                                    isOnline ? "text-green-600" : "text-gray-500"
                                }`}>
                                    {isOnline ? "Online" : "Offline"}
                                </span>
                                <button
                                    onClick={handleToggleOnline}
                                    className={`relative inline-flex h-8 w-14 rounded-full transition-colors duration-200 ${
                                        isOnline ? "bg-green-600" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 mt-1 rounded-full bg-white transition-transform duration-200 ${
                                            isOnline ? "translate-x-7" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {incomingRequest ? (
                        <div className={`border rounded-lg p-6 mb-6 ${
                            incomingRequest.accepted ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                        }`}>
                            <h3 className={`text-xl font-semibold mb-4 ${
                                incomingRequest.accepted ? "text-green-800" : "text-blue-800"
                            }`}>
                                {incomingRequest.accepted ? "✅ Booking Accepted" : "🔔 New Booking Request"}
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-800 mb-3">Customer Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-center mb-3">
                                            <img 
                                                src={getCustomerImage()} 
                                                alt="Customer" 
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=User";
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Name:</span>
                                            <p className="font-medium">{incomingRequest.customer_name || "Unknown"}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Phone:</span>
                                            <p className="font-medium">{incomingRequest.customer_phone || "Not provided"}</p>
                                        </div>
                                        {incomingRequest.accepted && (
                                            <div className="mt-3 p-2 bg-green-50 rounded">
                                                <span className="text-sm text-green-600">✅ Booking accepted at:</span>
                                                <p className="text-sm font-medium">{new Date(incomingRequest.timestamp).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-800 mb-3">Service Details</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Service:</span>
                                            <p className="font-medium">{incomingRequest.service_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Price:</span>
                                            <p className="font-medium text-green-600">₹{incomingRequest.service_price}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Request Time:</span>
                                            <p className="font-medium">{new Date(incomingRequest.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {incomingRequest.customer_address && Object.keys(incomingRequest.customer_address).length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Customer Address</h4>
                                    <div className="text-sm text-gray-700">
                                        <p><span className="font-medium">Name:</span> {incomingRequest.customer_address.name}</p>
                                        <p><span className="font-medium">Address:</span> {incomingRequest.customer_address.building}, {incomingRequest.customer_address.street}</p>
                                        <p>{incomingRequest.customer_address.city}, {incomingRequest.customer_address.district}</p>
                                        <p>{incomingRequest.customer_address.state} - {incomingRequest.customer_address.pincode}</p>
                                        <p className="mt-2">
                                            <span className="font-medium">Contact:</span> {incomingRequest.customer_address.mobile}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(!incomingRequest.customer_address || Object.keys(incomingRequest.customer_address).length === 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                                    <p className="text-yellow-700 text-sm">⚠️ Customer address not available. Please contact customer directly.</p>
                                </div>
                            )}

                            
                            <div className="flex space-x-4 mt-6">
                                {!incomingRequest.accepted ? (
                                    <>
                                        <button
                                            onClick={handleAcceptBooking}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                                        >
                                            ✅ Accept Booking
                                        </button>
                                        <button
                                            onClick={handleRejectBooking}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                                        >
                                            ❌ Reject
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => {
                                                    const address = incomingRequest.customer_address;
                                                    if (address && Object.keys(address).length > 0) {
                                                        const fullAddress = `${address.building}+${address.street}+${address.city}+${address.district}+${address.state}`;
                                                        window.open(`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}`, '_blank');
                                                    } else {
                                                        alert("Customer address not available. Please contact customer directly.");
                                                    }
                                                }}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                                            >
                                                🚗 Start Travel
                                            </button>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span>📝 Customer will pay after service completion</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <div className="text-4xl mb-4">📭</div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Bookings</h3>
                            <p className="text-gray-600">
                                {isOnline ? "You're online and ready to receive booking requests!" : "Go online to start receiving booking requests"}
                            </p>
                        </div>
                    )}

                    <div className="mt-10 text-center text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Barber Instant Booking System
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstantBooking;