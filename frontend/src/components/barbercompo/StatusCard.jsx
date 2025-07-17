import React from 'react';
import { Power, Clock } from 'lucide-react';

const StatusCard = ({ isOnline, toggleOnlineStatus, loading, waiting = false }) => {
  if (toggleOnlineStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Work Status
            </h3>
            <p className="text-sm text-gray-500">
              {isOnline
                ? "Available for bookings"
                : "Not receiving bookings"}
            </p>
          </div>
          <button
            onClick={toggleOnlineStatus}
            disabled={loading}
            className={`relative inline-flex h-8 w-16 rounded-full transition-colors duration-200 ease-in-out ${
              isOnline ? "bg-green-500" : "bg-gray-300"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out ${
                isOnline ? "translate-x-9" : "translate-x-1"
              } mt-1`}
            />
          </button>
        </div>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Waiting for bookings...
        </h3>
        <p className="text-sm text-gray-500">
          You're online and ready to receive booking requests
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Power className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        You're offline
      </h3>
      <p className="text-sm text-gray-500">
        Toggle online to start receiving booking requests
      </p>
    </div>
  );
};

export default StatusCard;