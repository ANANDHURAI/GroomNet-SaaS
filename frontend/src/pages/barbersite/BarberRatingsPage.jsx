import React from 'react';
import { useLocation } from 'react-router-dom';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import BarberRatings from './BarberRatings';

function BarberRatingsPage() {
  const barberId = sessionStorage.getItem('barber_id');
  
  console.log('BarberRatingsPage - Using session barber_id:', barberId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BarberSidebar />
      <div className="flex-1 p-6 ml-64">
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