import React, { useState } from 'react';

const CategoryCard = ({ category, onSelect, isSelected = false }) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  return (
    <div 
      className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect(category)}
    >
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {category.image && !imageError ? (
          <img 
            src={getImageUrl(category.image)} 
            alt={category.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
        {category.description && (
          <p className="text-gray-600 text-sm mt-1">{category.description}</p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;