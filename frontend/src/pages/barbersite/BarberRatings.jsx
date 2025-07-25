import React, { useEffect, useState } from 'react';
import { Star, User, Calendar, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';

const BarberRatings = ({ barberId }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const sessionBarberId = sessionStorage.getItem('barber_id');
    const currentBarberId = sessionBarberId || barberId;
    
    console.log('BarberRatings component mounted with barberId from URL:', barberId);
    console.log('Session barber_id:', sessionBarberId);
    console.log('Using barber_id:', currentBarberId);
    console.log('Type of barberId:', typeof currentBarberId);
    
    if (!currentBarberId || currentBarberId === 'undefined' || currentBarberId === 'null') {
      setError('Invalid barber ID - please ensure you are logged in');
      setLoading(false);
      return;
    }

    fetchRatings(currentBarberId);
  }, [barberId]);

  const fetchRatings = async (currentBarberId = null) => {
    const sessionBarberId = sessionStorage.getItem('barber_id');
    const barberIdToUse = currentBarberId || sessionBarberId || barberId;
    
    try {
      setLoading(true);
      console.log('Fetching ratings for barber ID:', barberIdToUse);
      const response = await apiClient.get(`/customersite/ratings/?barber=${barberIdToUse}`);
      console.log('API Response:', response.data);
      const ratingsData = response.data;
      
      setDebugInfo(`API called with barber ID: ${barberIdToUse}, Response length: ${ratingsData.length}`);
      
      setRatings(ratingsData);
      setTotalRatings(ratingsData.length);
      
      if (ratingsData.length > 0) {
        const total = ratingsData.reduce((sum, rating) => sum + rating.rating, 0);
        const avg = total / ratingsData.length;
        setAverageRating(Number(avg.toFixed(1)));
      } else {
        setAverageRating(0);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching barber ratings:', error);
      console.error('Error response:', error.response?.data);
      setError(`Failed to load ratings. ${error.response?.data?.detail || error.message}`);
      setDebugInfo(`Error: ${error.response?.status} - ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading ratings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchRatings()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/barber/portfolio')}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Portfolio
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Ratings & Reviews</h1>
        <p className="text-gray-600">See what your customers are saying about your services</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-gray-600 mt-1">Average Rating</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalRatings}</div>
              <div className="text-sm text-gray-600 mt-1">
                Total Review{totalRatings !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {ratings.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
          <p className="text-gray-600">
            Complete more bookings to start receiving customer reviews and ratings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {rating.user_name || 'Anonymous Customer'}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(rating.created_at)}</span>
                      {rating.service_name && (
                        <>
                          <span>•</span>
                          <span>{rating.service_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(rating.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {rating.rating}/5
                  </span>
                </div>
              </div>
              
              {rating.comment && (
                <div className="flex items-start space-x-2 mt-3">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{rating.comment}"
                  </p>
                </div>
              )}

              {rating.image && (
                <div className="mt-3">
                  <img
                    src={rating.image}
                    alt="Review"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarberRatings;