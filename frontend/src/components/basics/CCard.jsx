import React, { useState } from 'react';

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('hair')) return '💇';
  if (name.includes('beard') || name.includes('shave')) return '🧔';
  if (name.includes('facial') || name.includes('skin')) return '🧴';
  if (name.includes('massage') || name.includes('spa')) return '💆';
  if (name.includes('nail')) return '💅';
  if (name.includes('makeup')) return '💄';
  return '✨';
};

const CCard = ({ category }) => {
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

  const imageUrl = getImageUrl(category.image);

  return (
    <div className="group flex-shrink-0 w-72">
      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
        
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
          
          {imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={imageUrl || "/placeholder.svg"}
                alt={category.name}
                className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <div className="text-5xl mb-3 transform transition-transform duration-500 group-hover:scale-110">
                {getCategoryIcon(category.name)}
              </div>
              <span className="text-lg font-bold text-center px-4">{category.name}</span>
            </div>
          )}
          
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
              {category.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCard;
