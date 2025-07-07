import React, { useState, useEffect, useRef } from 'react';
import { Power, User, Clock, MapPin, Phone, Check, X, DollarSign } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';

const WorkingArea = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [acceptedBooking, setAcceptedBooking] = useState(null);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);

  const ACCESS_TOKEN = sessionStorage.getItem('access_token');

  useEffect(() => {
    fetchOnlineStatus();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchOnlineStatus = async () => {
    try {
      const response = await apiClient.get(`/instant-booking/barber/status/`);
      setIsOnline(response.data.is_online);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/instant-booking/barber/status/`, {
        is_online: !isOnline
      });

      setIsOnline(response.data.is_online);
      setNotification(response.data.is_online ? 'You are now online!' : 'You are now offline');
      
      if (response.data.is_online) {
        connectToBookingUpdates();
      } else {
        disconnectFromBookingUpdates();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const connectToBookingUpdates = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const wsUrl = `ws://localhost:8000/ws/instant-booking/general/?token=${ACCESS_TOKEN}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected for booking updates');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      if (data.booking_id && data.message === "New booking request") {
        setCurrentBooking(data);
        setNotification('New booking request received!');
      } else if (data.booking_taken) {
        setCurrentBooking(null);
        setNotification('Booking was taken by another barber');
      } else if (data.booking_expired) {
        setCurrentBooking(null);
        setNotification('Booking request expired');
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const disconnectFromBookingUpdates = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setCurrentBooking(null);
    setAcceptedBooking(null);
  };

  const handleAcceptBooking = async () => {
    if (!currentBooking) return;
    
    setLoading(true);
    try {
      const response = await apiClient.post(`/instant-booking/booking/${currentBooking.booking_id}/accept/`);
      
      setAcceptedBooking({
        ...currentBooking,
        customer_phone: response.data.customer_phone,
        customer_location: response.data.customer_location
      });
      setCurrentBooking(null);
      setNotification('Booking accepted successfully!');
    } catch (error) {
      console.error('Error accepting booking:', error);
      if (error.response?.status === 400) {
        setNotification('Booking already assigned to another barber');
        setCurrentBooking(null);
      } else {
        setNotification('Error accepting booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!currentBooking) return;
    
    setLoading(true);
    try {
      const response = await apiClient.post(`/instant-booking/booking/${currentBooking.booking_id}/reject/`);
      
      setCurrentBooking(null);
      setNotification('Booking rejected');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setNotification('Error rejecting booking');
    } finally {
      setLoading(false);
    }
  };

  const clearNotification = () => {
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    if (notification) {
      clearNotification();
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:block w-64 border-r bg-white">
        <BarberSidebar />
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Power
                  className={`w-5 h-5 ${
                    isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isOnline ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Work Status
                </h3>
                <p className="text-sm text-gray-500">
                  {isOnline
                    ? "Available for bookings"
                    : "Not receiving bookings"}
                </p>
              </div>
              <button
                onClick={toggleOnlineStatus}
                disabled={loading}
                className={`relative inline-flex h-8 w-16 rounded-full transition-colors duration-200 ease-in-out ${
                  isOnline ? "bg-green-500" : "bg-gray-300"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    isOnline ? "translate-x-9" : "translate-x-1"
                  } mt-1`}
                />
              </button>
            </div>
          </div>

          {notification && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">{notification}</p>
            </div>
          )}

          {currentBooking && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-orange-400">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  New Booking Request
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Pending
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {currentBooking.customer_name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {currentBooking.service_name} ({currentBooking.duration} mins)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    ${currentBooking.price}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {currentBooking.customer_location.address}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAcceptBooking}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={handleRejectBooking}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

          {acceptedBooking && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-green-400">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Booking
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Confirmed
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {acceptedBooking.customer_name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {acceptedBooking.customer_phone}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {acceptedBooking.service_name} ({acceptedBooking.duration} mins)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    ${acceptedBooking.price}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {acceptedBooking.customer_location.address}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!currentBooking && !acceptedBooking && isOnline && (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Waiting for bookings...
              </h3>
              <p className="text-sm text-gray-500">
                You're online and ready to receive booking requests
              </p>
            </div>
          )}

          {!isOnline && (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Power className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                You're offline
              </h3>
              <p className="text-sm text-gray-500">
                Toggle online to start receiving booking requests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkingArea;