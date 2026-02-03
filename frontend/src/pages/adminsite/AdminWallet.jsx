import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import { Calendar, Wallet, Activity, Filter, TrendingUp, TrendingDown } from 'lucide-react';

function AdminWallet() {
    const [walletData, setWalletData] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [periodStats, setPeriodStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        transactionCount: 0
    });

    useEffect(() => {
        fetchWalletData();
        fetchPaymentHistory();
    }, []);

    useEffect(() => {
        filterTransactionsByPeriod();
    }, [paymentHistory, selectedPeriod]);

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
            const rawHistory = res.data.history || [];
            const uniqueHistory = Array.from(
                new Map(rawHistory.map(item => [item.id, item])).values()
            );
            
            setPaymentHistory(uniqueHistory);
        } catch (err) {
            console.error("Error fetching payment history", err);
        }
    };

    const getDateRangeForPeriod = (period) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (period) {
            case 'today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
                };
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return { start: weekStart, end: weekEnd };
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
                return { start: monthStart, end: monthEnd };
            default:
                return null;
        }
    };

    const filterTransactionsByPeriod = () => {
        let filtered = [...paymentHistory];
        
        if (selectedPeriod !== 'all') {
            const dateRange = getDateRangeForPeriod(selectedPeriod);
            if (dateRange) {
                filtered = paymentHistory.filter(txn => {
                    const txnDate = new Date(txn.created_at);
                    return txnDate >= dateRange.start && txnDate <= dateRange.end;
                });
            }
        }

        const stats = filtered.reduce((acc, txn) => {
            const isExpense = txn.note?.toLowerCase().includes('payout') ||
                              txn.note?.toLowerCase().includes('refund');
            const amount = Math.abs(txn.amount);
            
            if (isExpense) {
                acc.totalExpense += amount;
            } else {
                acc.totalIncome += amount;
            }
            
            acc.transactionCount++;
            return acc;
        }, {
            totalIncome: 0,
            totalExpense: 0,
            transactionCount: 0
        });

        stats.netAmount = stats.totalIncome - stats.totalExpense;
        
        setFilteredHistory(filtered);
        setPeriodStats(stats);
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

    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 'today': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            default: return 'All Time';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="w-64">
                    <AdminSidebar />
                </div>
                <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-gray-700 text-lg">Loading wallet data...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="w-64">
                    <AdminSidebar />
                </div>
                <div className="flex-1 p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
                        <strong className="font-bold">Error!</strong>
                        <div className="mt-2">{error}</div>
                        <button 
                            onClick={fetchWalletData}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-72">
                <AdminSidebar />
            </div>
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white shadow-sm rounded-2xl p-8">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">GroomNet Admin Wallet</h1>
                            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Total Earnings</h2>
                                </div>
                                <p className="text-3xl font-bold mb-2">
                                    {formatCurrency(walletData?.total_earnings)}
                                </p>
                                <p className="text-sm opacity-90">
                                    Last updated: {formatDate(walletData?.last_updated)}
                                </p>
                            </div>

                            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Activity className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Total Transactions</h2>
                                </div>
                                <p className="text-3xl font-bold text-gray-800 mb-2">
                                    {paymentHistory.length}
                                </p>
                                <p className="text-sm text-gray-600">All time transactions</p>
                            </div>

                            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">This Month</h2>
                                </div>
                                <p className="text-3xl font-bold text-gray-800 mb-2">
                                    {(() => {
                                        const monthlyTransactions = paymentHistory.filter(txn => {
                                            const txnDate = new Date(txn.created_at);
                                            const now = new Date();
                                            return txnDate.getMonth() === now.getMonth() && 
                                                   txnDate.getFullYear() === now.getFullYear();
                                        });
                                        return monthlyTransactions.length;
                                    })()}
                                </p>
                                <p className="text-sm text-gray-600">Monthly transactions</p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Filter className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Transaction Analysis</h3>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Period:</label>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Income</span>
                                    </div>
                                    <p className="text-xl font-bold text-green-700">
                                        {formatCurrency(periodStats.totalIncome)}
                                    </p>
                                </div>

                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-800">Expenses</span>
                                    </div>
                                    <p className="text-xl font-bold text-red-700">
                                        {formatCurrency(periodStats.totalExpense)}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg ${
                                    periodStats.netAmount >= 0 
                                        ? 'bg-blue-50 border border-blue-200' 
                                        : 'bg-orange-50 border border-orange-200'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet className={`w-4 h-4 ${
                                            periodStats.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
                                        }`} />
                                        <span className={`text-sm font-medium ${
                                            periodStats.netAmount >= 0 ? 'text-blue-800' : 'text-orange-800'
                                        }`}>Net Amount</span>
                                    </div>
                                    <p className={`text-xl font-bold ${
                                        periodStats.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'
                                    }`}>
                                        {formatCurrency(periodStats.netAmount)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-800">Transactions</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-700">
                                        {periodStats.transactionCount}
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <strong>Showing transactions for:</strong> {getPeriodLabel()} 
                                {selectedPeriod !== 'all' && (
                                    <span className="ml-2">
                                        ({filteredHistory.length} of {paymentHistory.length} total transactions)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-gray-700" />
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            Transaction History - {getPeriodLabel()}
                                        </h3>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {filteredHistory.length} transactions
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {filteredHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <div className="text-gray-500 text-lg mb-2">
                                            {selectedPeriod === 'all' ? 'No transactions found' : `No transactions for ${getPeriodLabel().toLowerCase()}`}
                                        </div>
                                        {selectedPeriod !== 'all' && (
                                            <button
                                                onClick={() => setSelectedPeriod('all')}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                View all transactions
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredHistory.map((txn) => {
                                            const isExpense = txn.note?.toLowerCase().includes('payout') ||
                                                            txn.note?.toLowerCase().includes('refund');
                                            const amountClass = isExpense ? 'text-red-600' : 'text-green-600';
                                            const sign = isExpense ? '-' : '+';
                                            const bgClass = isExpense ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
                                            
                                            return (
                                                <div key={txn.id} className={`flex items-center justify-between p-4 border rounded-lg ${bgClass}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${isExpense ? 'bg-red-100' : 'bg-green-100'}`}>
                                                            {isExpense ? (
                                                                <TrendingDown className="w-5 h-5 text-red-600" />
                                                            ) : (
                                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className={`text-lg font-semibold ${amountClass}`}>
                                                                {sign}{formatCurrency(Math.abs(txn.amount))}
                                                            </div>
                                                            <div className="text-sm text-gray-600">{txn.note}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(txn.created_at)}
                                                        </div>
                                                        <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                                            isExpense ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                                        }`}>
                                                            {isExpense ? 'Expense' : 'Income'}
                                                        </div>
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
            </div>
        </div>
    );
}

export default AdminWallet;