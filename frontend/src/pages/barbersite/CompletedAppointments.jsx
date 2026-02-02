import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import {
  Calendar, Clock, Phone, MapPin, BadgeCheck, Zap, Filter
} from 'lucide-react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';

function CompletedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterType, setFilterType] = useState('ALL');

  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        const response = await apiClient.get('/barbersite/completed-barber-appointments/');
        setAppointments(response.data);
        setFilteredAppointments(response.data);
      } catch (error) {
        console.error('Error fetching completed appointments:', error);
      }
    };

    fetchCompletedAppointments();
  }, []);


  useEffect(() => {
    if (filterType === 'ALL') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(appt => appt.bookingType === filterType);
      setFilteredAppointments(filtered);
    }
  }, [filterType, appointments]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <div className="w-72">
        <BarberSidebar />
      </div>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Completed Appointments</h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              className="border text-sm rounded-md px-3 py-1 focus:outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="INSTANT_BOOKING">Instant Booking</option>
              <option value="SCHEDULE_BOOKING">Schedule Booking</option>
            </select>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500">No completed appointments found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-200 
                          hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                
                <span className="absolute top-4 right-4 flex items-center gap-1 
                                text-xs font-semibold text-green-600 bg-green-100 
                                px-3 py-1 rounded-full">
                  <BadgeCheck className="w-4 h-4" /> Completed
                </span>

                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {appt.customer_name}
                </h2>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{appt.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{appt.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span className="line-clamp-2">{appt.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{appt.phone}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t mt-3">
                    <span className="text-sm font-medium text-gray-700">
                      {appt.service}
                    </span>

                    <span className="text-green-700 font-semibold">
                      ₹{appt.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-yellow-600 uppercase font-medium">
                    {appt.bookingType === 'INSTANT_BOOKING' && (
                      <>
                        <Zap className="w-4 h-4" /> Instant Booking
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CompletedAppointments;
