import React, { useState } from 'react';

const getServiceIcon = (serviceName) => {
  const name = serviceName?.toLowerCase() || '';
  if (name.includes('hair') || name.includes('cut')) return '✂️';
  if (name.includes('beard') || name.includes('shave')) return '🪒';
  if (name.includes('facial') || name.includes('face')) return '🧴';
  if (name.includes('massage')) return '💆';
  if (name.includes('nail') || name.includes('manicure')) return '💅';
  return '✨';
};

const SCard = ({ service }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const imageUrl = getImageUrl(service.image);

  return (
    <div className="group flex-shrink-0 w-80">
      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"></div>
          
          {imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={imageUrl || "/placeholder.svg"}
                alt={service.name}
                className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <div className="text-6xl mb-4 transform transition-transform duration-500 group-hover:scale-110">
                {getServiceIcon(service.name)}
              </div>
              <span className="text-lg font-bold text-center px-4">{service.name}</span>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">
              ₹{service.price}
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
              {service.name}
            </h3>
            <div className="flex-shrink-0 ml-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {service.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium">{service.duration_minutes} mins</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-xl text-xs font-bold">
              {service.category?.name || 'General'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SCard;
