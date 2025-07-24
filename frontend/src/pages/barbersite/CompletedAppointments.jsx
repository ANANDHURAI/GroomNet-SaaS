import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { Calendar, Clock, Phone, MapPin, BadgeCheck } from 'lucide-react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';

function CompletedAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        const response = await apiClient.get('/barbersite/completed-barber-appointments/');
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching completed appointments:', error);
      }
    };

    fetchCompletedAppointments();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 hidden md:block bg-white border-r border-gray-200">
        <BarberSidebar />
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Completed Appointments</h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No completed appointments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-700">{appt.customer_name}</h2>
                  <BadgeCheck className="text-green-500 w-5 h-5" />
                </div>

                <div className="text-sm text-gray-600 space-y-1">
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
                    <span>{appt.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{appt.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Service:</span>
                    <span>{appt.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className="uppercase">{appt.bookingType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Price:</span>
                    <span className="text-green-700 font-semibold">₹{appt.price.toFixed(2)}</span>
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

export default CompletedAppointments;
