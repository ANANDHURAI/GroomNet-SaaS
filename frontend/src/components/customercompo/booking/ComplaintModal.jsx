import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import apiClient from '../../../slices/api/apiIntercepters';

function ComplaintModal({ bookingId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    complaint_name: '',
    description: '',
    image: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'File size must be less than 5MB'
        }));
        return;
      }
    
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Only JPEG, PNG files are allowed'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.complaint_name.trim()) {
      newErrors.complaint_name = 'Complaint title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('complaint_name', formData.complaint_name.trim());
      submitData.append('description', formData.description.trim());
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await apiClient.post(`/customersite/complaints/${bookingId}/create/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to submit complaint. Please try again.';
      
      if (error.response?.status === 400 && errorMessage.includes('already submitted')) {
        setErrors({ general: 'You have already submitted a complaint for this booking.' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Submit Complaint</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm text-red-600">{errors.general}</span>
            </div>
          )}

          <div>
            <label htmlFor="complaint_name" className="block text-sm font-medium text-gray-700 mb-1">
              Complaint Title *
            </label>
            <input
              type="text"
              id="complaint_name"
              name="complaint_name"
              value={formData.complaint_name}
              onChange={handleInputChange}
              placeholder="Brief title for your complaint"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.complaint_name ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength="255"
            />
            {errors.complaint_name && (
              <p className="text-sm text-red-600 mt-1">{errors.complaint_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your complaint in detail..."
              rows="4"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Attach Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
              />
              <label
                htmlFor="image"
                className={`flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                  errors.image ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <Upload size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formData.image ? formData.image.name : 'Choose file (JPEG, PNG - Max 5MB)'}
                </span>
              </label>
            </div>
            {errors.image && (
              <p className="text-sm text-red-600 mt-1">{errors.image}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComplaintModal;