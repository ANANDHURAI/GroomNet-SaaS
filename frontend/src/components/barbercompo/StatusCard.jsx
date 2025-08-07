import React from 'react';
import { Power, Clock } from 'lucide-react';

const StatusCard = ({ isOnline, toggleOnlineStatus, loading, waiting = false }) => {
  if (toggleOnlineStatus) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 relative overflow-hidden">
 
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Work Status
              </h3>
            </div>
            <p className={`text-lg font-medium ${
              isOnline ? 'text-green-600' : 'text-slate-500'
            }`}>
              {isOnline
                ? "Available for bookings"
                : "Not receiving bookings"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {isOnline 
                ? "Customers can see you're online" 
                : "Go online to start receiving requests"}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={toggleOnlineStatus}
              disabled={loading}
              className={`relative inline-flex h-12 w-24 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                isOnline 
                  ? "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700" 
                  : "bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500"
              } ${loading ? "opacity-50 cursor-not-allowed scale-95" : "cursor-pointer hover:scale-105 active:scale-95"}`}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-md ${
                  isOnline ? "translate-x-12" : "translate-x-1"
                } mt-1 flex items-center justify-center`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Power className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
                )}
              </span>
            </button>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isOnline 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-10 text-center border border-blue-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-5 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-inner relative">
            <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-300 border-t-blue-600 animate-spin opacity-30"></div>
          </div>
          
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Waiting for bookings...
          </h3>
          <p className="text-lg text-blue-600 font-medium mb-2">
            You're online and ready!
          </p>
          <p className="text-blue-500 max-w-sm mx-auto leading-relaxed">
            New booking requests will appear here automatically
          </p>
          
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl shadow-xl p-10 text-center border border-slate-200 relative overflow-hidden">
     
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-gray-200 to-slate-300 rounded-full -translate-y-20 -translate-x-20 opacity-30"></div>
      
      <div className="relative z-10">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
          <Power className="w-12 h-12 text-gray-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-700 mb-3">
          You're offline
        </h3>
        <p className="text-lg text-slate-500 font-medium mb-2">
          Not receiving requests
        </p>
        <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
          Toggle online to start receiving booking requests from customers
        </p>
        
        <div className="mt-6 flex justify-center">
          <div className="w-4 h-4 bg-slate-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;