import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { MessageCircle, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useBooking } from '../../contexts/BookingContext';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const handleStartTravel = (bookingId) => {
    navigate(`/travel-status/${bookingId}`);
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('barbersite/barber-appointments/');
      const scheduledBookings = response.data.filter(
        booking => booking.bookingType === 'SCHEDULE_BOOKING'
      );
      setAppointments(scheduledBookings);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError('Failed to load scheduled appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <LoadingSpinner text="Loading scheduled appointments..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Appointments</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAppointments}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Scheduled Appointments</h1>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Scheduled Appointments</h3>
            <p className="text-gray-500">
              You don't have any upcoming scheduled bookings
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/barber/chat/${appointment.id}`, {
                          state: {
                            appointmentData: appointment,
                            customerName: appointment.customer_name
                          }
                        })}
                        className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full"
                        title="Chat with customer"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="font-medium">#{appointment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{appointment.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium">{appointment.service}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">₹{appointment.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{appointment.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{appointment.time}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{appointment.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{appointment.phone}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleStartTravel(appointment.id)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Start Travel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments;