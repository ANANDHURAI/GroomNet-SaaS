import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import apiClient from '../../../slices/api/apiIntercepters';
import { toast } from 'react-hot-toast';

const RatingModal = ({ bookingId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    comment: '',
    rating: 0,
    image: null
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingId) {
      toast.error('Booking ID is missing');
      return;
    }
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please enter your review');
      return;
    }

    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('booking', bookingId);
    submitData.append('comment', formData.comment.trim());
    submitData.append('rating', formData.rating);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      await apiClient.post('/customersite/ratings/', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Rating submission error:', error.response?.data);
      
      let errorMessage = 'Failed to submit review';
      
      if (error.response?.status === 400) {
        
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Rating *
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= (hoveredRating || formData.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {formData.rating > 0 && (
        <p className="text-sm text-gray-600 mt-1">
          {formData.rating} star{formData.rating !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Rate Your Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <StarRating />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                placeholder="Share your experience with this service..."
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange('image', e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.image && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.image.name}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.rating === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;