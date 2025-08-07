import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { Wallet, Calendar, IndianRupee } from 'lucide-react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useBooking } from '../../contexts/BookingContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Earnings() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    currentBooking,
    notification,
    setNotification
  } = useBooking();

  const navigate = useNavigate();
  const location = useLocation();
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await apiClient.get('/barbersite/barber/wallet/');
        setWallet(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">

      <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />

      <div className="w-64 hidden md:block">
        <BarberSidebar />
      </div>

      <div className="flex-1 p-4 md:p-8">
        {currentBooking?.status === 'PENDING' && (
          <div className="md:hidden bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg mb-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">New Booking Request!</p>
                <p className="text-sm opacity-90">{currentBooking.customer_name} • ₹{currentBooking.total_amount}</p>
              </div>
              <button
                onClick={() => navigate('/instant-booking/')}
                className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                View
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center mt-10 text-lg font-medium text-gray-700">Loading...</div>
        ) : error ? (
          <div className="text-center mt-10 text-red-500 font-medium">{error}</div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Wallet className="text-green-500" /> Earnings Bag
            </h2>


            <div className="bg-white shadow-lg p-6 rounded-xl mb-8">
              <p className="text-2xl font-semibold text-green-600 flex items-center gap-2">
                <IndianRupee /> {wallet?.balance || '0.00'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {wallet?.updated_at ? new Date(wallet.updated_at).toLocaleString() : 'Never'}
              </p>
            </div>

         
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white shadow p-4 rounded-lg">
                <h4 className="text-sm text-gray-500">Today's Earnings</h4>
                <p className="text-lg font-semibold text-green-700">
                  ₹{wallet?.day_total || '0.00'}
                </p>
              </div>
              <div className="bg-white shadow p-4 rounded-lg">
                <h4 className="text-sm text-gray-500">This Week</h4>
                <p className="text-lg font-semibold text-green-700">
                  ₹{wallet?.week_total || '0.00'}
                </p>
              </div>
              <div className="bg-white shadow p-4 rounded-lg">
                <h4 className="text-sm text-gray-500">This Month</h4>
                <p className="text-lg font-semibold text-green-700">
                  ₹{wallet?.month_total || '0.00'}
                </p>
              </div>
            </div>

            
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Transaction History</h3>

            {wallet?.transactions?.length === 0 ? (
              <p className="text-gray-500">No transactions yet.</p>
            ) : (
              <div className="bg-white rounded-lg shadow divide-y">
                {wallet.transactions?.map(tx => (
                  <div key={tx.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-green-700 font-medium">+₹{tx.amount}</p>
                      {tx.note && <p className="text-sm text-gray-500">{tx.note}</p>}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Earnings;
