import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import ServiceCard from '../../components/barbercompo/ServiceCard';
import ServiceCount from '../../components/basics/ServiceCount';
import { useService } from '../../contexts/ServiceContext';
import { LoaderCircle, Wrench } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';

function MyServices() {
  const { myServices, loading, fetchMyServices } = useService();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalPrice: 0, totalDuration: 0 });

  const location = useLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    fetchMyServices();
  }, []);

  useEffect(() => {
    const totalPrice = myServices.reduce((sum, item) => sum + parseFloat(item.service.price), 0);
    const totalDuration = myServices.reduce((sum, item) => sum + item.service.duration_minutes, 0);
    setStats({ totalPrice, totalDuration });
  }, [myServices]);

  const handleAddMoreServices = () => navigate('/barber/book-services');

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <BarberSidebar />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BarberSidebar />
      <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Services</h1>
              <p className="text-gray-600">Services you're offering to customers</p>
            </div>
            <ServiceCount />
          </div>

          {myServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Services</h3>
                <p className="text-3xl font-bold text-blue-600">{myServices.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Value</h3>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalPrice.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Duration</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalDuration} min</p>
              </div>
            </div>
          )}

          {myServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {myServices.map((barberService) => (
                  <ServiceCard
                    key={barberService.id}
                    service={barberService.service}
                    showRemoveButton
                    barberServiceId={barberService.id}
                  />
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={handleAddMoreServices}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Add More Services
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Added Yet</h3>
              <p className="text-gray-500 mb-6">Start building your service portfolio by adding services.</p>
              <button
                onClick={handleAddMoreServices}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Browse Services
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyServices;
