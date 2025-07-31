import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import { Calendar, Wallet, Activity } from 'lucide-react';

function AdminWallet() {
    const [walletData, setWalletData] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWalletData();
        fetchPaymentHistory();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/adminsite/admin-wallet/');
            setWalletData(response.data);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setError('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const res = await apiClient.get('/adminsite/admin-wallet/transactions/');
            setPaymentHistory(res.data.history || []);
        } catch (err) {
            console.error("Error fetching payment history", err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading wallet data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto mt-8">
                <strong className="font-bold">Error!</strong>
                <div className="mt-2">{error}</div>
                <button 
                    onClick={fetchWalletData}
                    className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-64">
                <AdminSidebar />
            </div>
            <div className="flex-1 p-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Wallet</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-5 h-5" />
                                <h2 className="text-xl font-semibold">Total Earnings</h2>
                            </div>
                            <p className="text-3xl font-bold">
                                {formatCurrency(walletData?.total_earnings)}
                            </p>
                            <p className="text-sm opacity-80 mt-2">
                                Last updated: {formatDate(walletData?.last_updated)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-gray-700" />
                            <h3 className="text-xl font-semibold text-gray-800">Transaction History</h3>
                        </div>

                        {paymentHistory.length === 0 ? (
                            <div className="text-gray-500 text-sm text-center">No transactions found.</div>
                        ) : (
                            <div className="space-y-4">
                                {paymentHistory.map((txn) => {
                                    const isExpense = txn.note?.toLowerCase().includes('payout') ||
                                                      txn.note?.toLowerCase().includes('refund');
                                    const amountClass = isExpense ? 'text-red-600' : 'text-green-600';
                                    const sign = isExpense ? '-' : '+';
                                    
                                    return (
                                        <div key={txn.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <div className={`text-lg font-semibold ${amountClass}`}>
                                                    {sign}{formatCurrency(Math.abs(txn.amount))}
                                                </div>
                                                <div className="text-sm text-gray-600">{txn.note}</div>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(txn.created_at)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminWallet;
