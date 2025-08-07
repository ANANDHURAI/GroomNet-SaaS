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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <BarberSidebar />
      
      <div className="flex-1 ml-72 p-8">
        <GlobalBookingNotifier
          currentBooking={currentBooking}
          notification={notification}
          setNotification={setNotification}
          navigate={navigate}
          location={location}
          isOnWorkingAreaPage={isOnWorkingAreaPage}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h6 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">
                My Services
              </h6>
              <p className="text-lg text-gray-600">
                Services you're offering to customers
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-4"></div>
            </div>
            
            <div className="flex items-center gap-4">
              <ServiceCount />
              <button
                onClick={handleAddMoreServices}
                className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Services
              </button>
            </div>
          </div>

          {myServices.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 rounded-xl shadow border border-gray-200 hover:border-blue-300 p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer relative overflow-hidden text-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900 text-white text-[10px] px-2 py-1 rounded-full">
                    Active Services
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Total Services</h3>
                <p className="text-2xl font-bold text-blue-600 group-hover:scale-105 transition-transform">
                  {myServices.length}
                </p>
              </div>

              <div className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50 rounded-xl shadow border border-gray-200 hover:border-green-300 p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer relative overflow-hidden text-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-900 text-white text-[10px] px-2 py-1 rounded-full">
                    Revenue Potential
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Total Value</h3>
                <p className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform">
                  ₹{stats.totalPrice.toFixed(2)}
                </p>
              </div>

              <div className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-purple-50 rounded-xl shadow border border-gray-200 hover:border-purple-300 p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer relative overflow-hidden text-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-purple-900 text-white text-[10px] px-2 py-1 rounded-full">
                    Time Required
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Total Duration</h3>
                <p className="text-2xl font-bold text-purple-600 group-hover:scale-105 transition-transform">
                  {stats.totalDuration} min
                </p>
              </div>
            </div>
          )}


          {myServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {myServices.map((barberService, index) => (
                  <div
                    key={barberService.id}
                    className="group relative transform transition-all duration-300 hover:-translate-y-3"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                  
                    <div className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 rounded-2xl shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <ServiceCard
                        service={barberService.service}
                        showRemoveButton
                        barberServiceId={barberService.id}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={handleAddMoreServices}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add More Services
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </button>
              </div>
            </>
          ) : (
          
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-lg mx-auto">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="w-12 h-12 text-blue-500 animate-pulse" />
                  </div>
                  <div className="absolute -top-2 -right-6 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-6 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No Services Added Yet
                </h3>
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  Start building your service portfolio by adding services that showcase your expertise.
                </p>
                
                <button
                  onClick={handleAddMoreServices}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Services
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyServices;
