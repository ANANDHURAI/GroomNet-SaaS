import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';

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
                            <h2 className="text-xl font-semibold mb-2">💰 Total Earnings</h2>
                            <p className="text-3xl font-bold">
                                {formatCurrency(walletData?.total_earnings)}
                            </p>
                            <p className="text-sm opacity-80 mt-2">
                                Last updated: {formatDate(walletData?.last_updated)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Payment Activity</h3>
                        {walletData?.last_updated && (
                            <div className="mt-4 p-3 bg-blue-100 rounded">
                                <p className="text-sm font-medium text-blue-800">
                                    Last transaction processed: {formatDate(walletData.last_updated)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Wallet Transaction History</h3>
                        {paymentHistory.length === 0 ? (
                            <p className="text-gray-600">No transactions found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2">Type</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2">Note</th>
                                            <th className="px-4 py-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map((txn, index) => {
                                            const isCredit = txn.transaction_type === 'customer_payment' || txn.transaction_type === 'platform_fee';
                                            const sign = isCredit ? '+' : '-';
                                            const color = isCredit ? 'text-green-600' : 'text-red-600';
                                            return (
                                                <tr key={index} className="border-b">
                                                    <td className="px-4 py-2 capitalize">
                                                        {txn.transaction_type.replace('_', ' ')}
                                                    </td>
                                                    <td className={`px-4 py-2 font-semibold ${color}`}>
                                                        {sign}{formatCurrency(txn.amount)}
                                                    </td>
                                                    <td className="px-4 py-2">{txn.note || '-'}</td>
                                                    <td className="px-4 py-2">{formatDate(txn.created_at)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default AdminWallet;
