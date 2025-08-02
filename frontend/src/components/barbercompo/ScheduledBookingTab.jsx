import React from 'react';
import { Clock } from 'lucide-react';
import Appointments from '../../pages/barbersite/Appointments';

const ScheduledBookingTab = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center relative">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Clock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Your Scheduled Booking
      </h3>
      <Appointments />
    </div>
  );
};

export default ScheduledBookingTab;