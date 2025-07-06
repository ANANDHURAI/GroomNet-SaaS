import React from 'react';
import { MapPin, CheckCircle } from 'lucide-react';

const LocationButton = ({ onClick, loading, success }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-colors mb-4
      ${
        loading
          ? 'bg-orange-200 text-orange-700 cursor-not-allowed'
          : success
          ? 'bg-green-100 text-green-700'
          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      }
    `}
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
        Getting Location...
      </>
    ) : success ? (
      <>
        <CheckCircle className="w-5 h-5" />
        Location Added! Redirecting...
      </>
    ) : (
      <>
        <MapPin className="w-5 h-5" />
        Use Current Location
      </>
    )}
  </button>
);

export default LocationButton;
