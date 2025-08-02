import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import BarberRatings from './BarberRatings';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useBooking } from '../../contexts/BookingContext';


function BarberRatingsPage() {

  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');
  const barberId = sessionStorage.getItem('barber_id');
  

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BarberSidebar />
      
      <div className="flex-1 p-6 ml-64">
        <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BarberRatings barberId={barberId} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarberRatingsPage;