import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  Scissors, 
  User, 
  AlertCircle 
} from 'lucide-react';

const ServiceConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onResponse, 
  barberName, 
  serviceName,
  isResponding = false 
}) => {
  const [selectedResponse, setSelectedResponse] = useState(null);

  const handleResponse = (response) => {
    setSelectedResponse(response);
    onResponse(response);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in slide-in-from-bottom-4">
        <div className="p-6">
        
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Scissors className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Service Request</h3>
                <p className="text-sm text-gray-600">From your barber</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isResponding}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

       
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{barberName}</p>
                <p className="text-sm text-gray-600">Your assigned barber</p>
              </div>
            </div>
            
       
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <p className="text-blue-800 font-medium text-center">
                "I've arrived at your location and I'm ready to start the {serviceName} service. Are you ready?"
              </p>
            </div>

          
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Barber is waiting for your response</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleResponse('ready')}
              disabled={isResponding}
              className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center ${
                isResponding && selectedResponse === 'ready'
                  ? 'bg-green-400 cursor-not-allowed'
                  : isResponding
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-95'
              }`}
            >
              {isResponding && selectedResponse === 'ready' ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>I'm Ready!</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleResponse('wait')}
              disabled={isResponding}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                isResponding && selectedResponse === 'wait'
                  ? 'bg-orange-400 cursor-not-allowed text-white'
                  : isResponding
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-50 active:scale-95'
              }`}
            >
              {isResponding && selectedResponse === 'wait' ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Requesting wait...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Please Wait (1 min)</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p><strong>Ready:</strong> Service will start immediately</p>
                <p><strong>Wait:</strong> Barber will wait for 1 minute before starting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfirmationModal;