import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import { Wallet, Calendar, IndianRupee } from 'lucide-react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';

function Earnings() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="w-64 hidden md:block">
        <BarberSidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
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
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Transaction History</h3>

            {wallet?.transactions?.length === 0 ? (
              <p className="text-gray-500">No transactions yet.</p>
            ) : (
              <div className="bg-white rounded-lg shadow divide-y">
                {wallet.transactions.map(tx => (
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
