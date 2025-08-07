import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { MessageCircle, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBadge from '../../components/notification/NotificationBadge';
import { useNotifications } from '../../components/customHooks/useNotifications';


function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { bookingUnreadCounts } = useNotifications();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-slate-200"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Scheduled Appointments
              </h1>
              <p className="text-slate-600 mt-1">Manage your upcoming bookings</p>
            </div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
              <Clock className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Appointments Yet</h3>
            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
              Your scheduled bookings will appear here when customers make appointments
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment, index) => (
              <div 
                key={appointment.id} 
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden transform hover:-translate-y-1"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Appointment Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                          <span className="text-sm font-medium">#{appointment.id}</span>
                        </div>
                        <div className="bg-green-400 bg-opacity-90 rounded-full px-3 py-1">
                          <span className="text-sm font-medium">Scheduled</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{appointment.customer_name}</h3>
                      <p className="text-indigo-100">{appointment.service}</p>
                    </div>
                    
                    {/* Chat Button */}
                    <div className="relative">
                      <button 
                        onClick={() => navigate(`/barber/chat/${appointment.id}`, {
                          state: {
                            appointmentData: appointment,
                            customerName: appointment.customer_name
                          }
                        })}
                        className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 backdrop-blur-sm"
                        title="Chat with customer"
                      >
                        <MessageCircle size={20} />
                      </button>
                      {bookingUnreadCounts[appointment.id] > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                          {bookingUnreadCounts[appointment.id]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Date & Time</p>
                        <p className="font-bold text-slate-800 text-lg">{appointment.date}</p>
                        <p className="text-slate-600">{appointment.time}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Price</p>
                        <p className="font-bold text-slate-800 text-xl">₹{appointment.price}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Contact</p>
                      <p className="font-semibold text-slate-800 mb-2">{appointment.phone}</p>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        <p className="font-medium text-slate-700 mb-1">Address:</p>
                        <p>{appointment.address}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Service Details</p>
                      <p className="font-bold text-slate-800 text-lg mb-1">{appointment.service}</p>
                      <p className="text-slate-600 text-sm">Professional service</p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleStartTravel(appointment.id)}
                      className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                    >
                      <span>Start Journey</span>
                      <div className="w-2 h-2 bg-white rounded-full group-hover:animate-bounce"></div>
                    </button>
                  </div>
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