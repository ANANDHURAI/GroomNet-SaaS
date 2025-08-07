import React from 'react';
import { Clock } from 'lucide-react';
import Appointments from '../../pages/barbersite/Appointments';

const ScheduledBookingTab = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center relative">
      <Appointments />
    </div>
  );
};

export default ScheduledBookingTab;