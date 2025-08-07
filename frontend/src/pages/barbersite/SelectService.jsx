import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import { useService } from '../../contexts/ServiceContext';
import ServiceCard from '../../components/barbercompo/ServiceCard';
import ServiceCount from '../../components/basics/ServiceCount';
import { ArrowLeft, AlertCircle, LoaderCircle, ClipboardCheck } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';


function SelectService() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState(location.state?.category || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { serviceCount, fetchMyServices } = useService();

  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    fetchServices();
    fetchMyServices();
  }, [id]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/barbersite/barber-services/services_by_category/?category_id=${id}`);
      setServices(response.data.services);
      if (!category) setCategory(response.data.category);
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => navigate('/barber/book-services');
  const handleViewMyServices = () => navigate('/barber/my-services');
  const handleServiceAdded = () => fetchServices();

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <BarberSidebar />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <button
                onClick={handleBackToCategories}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-3"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Categories
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {category ? `${category.name} Services` : 'Select Services'}
              </h1>
              <p className="text-gray-600">Add services to your offerings</p>
            </div>
            <div className="flex items-center gap-4">
              <ServiceCount />
              {serviceCount > 0 && (
                <button
                  onClick={handleViewMyServices}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  View My Services
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  showAddButton
                  onServiceAdded={handleServiceAdded}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">All Services Added</h3>
              <p className="text-gray-500 mb-6">You've added all available services from this category.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleBackToCategories}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Browse Other Categories
                </button>
                <button
                  onClick={handleViewMyServices}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                >
                  View My Services
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

export default SelectService;
