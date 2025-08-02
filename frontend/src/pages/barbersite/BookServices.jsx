import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import ServiceCount from '../../components/basics/ServiceCount';
import CategoryCard from '../../components/barbercompo/CategoryCard';
import { LoaderCircle, ClipboardList } from 'lucide-react';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useBooking } from '../../contexts/BookingContext';

function BookServices() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/barbersite/barber-services/categories/');
      setCategories(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleProceed = () => {
    if (selectedCategory) {
      navigate(`/barber/select-service/${selectedCategory.id}`, {
        state: { category: selectedCategory }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <BarberSidebar />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BarberSidebar />
      <div className="flex-1 ml-64 p-8">
        <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Select Service Category</h1>
                <p className="text-gray-600">Choose a category to view available services</p>
              </div>
            </div>
            <ServiceCount />
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {categories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onSelect={handleCategorySelect}
                    isSelected={selectedCategory?.id === category.id}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    selectedCategory
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer transform hover:scale-105'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!selectedCategory}
                  onClick={handleProceed}
                >
                  {selectedCategory
                    ? `View ${selectedCategory.name} Services`
                    : 'Select a Category'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Available</h3>
              <p className="text-gray-500">Please contact admin to add service categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookServices;
