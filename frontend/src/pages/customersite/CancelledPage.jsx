import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/basics/Navbar';

function CancelledPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-red-600 mb-3">Payment Cancelled</h1>
          <p className="text-gray-700 mb-2">You cancelled the payment process.</p>
          <p className="text-gray-600 text-sm mb-6">Your booking was not created and no charges were made.</p>
          
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💳 <strong>No charges applied</strong> - You can try booking again anytime.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-2)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CancelledPage;
