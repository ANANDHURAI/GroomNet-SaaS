import React, { useEffect, useState } from 'react'
import { Button } from '../../components/mini ui/Button'
import apiClient from '../../slices/api/apiIntercepters'
import { Check, Wallet, Plus, Clock } from 'lucide-react'
import CustomerLayout from '../../components/customercompo/CustomerLayout'

function CustomerWallet() {
    const [amount, setAmount] = useState('')
    const [walletDetails, setWalletDetails] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successAmount, setSuccessAmount] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [message, setMessage] = useState('')


    const fetchWalletDetails = () => {
        apiClient.get('/customersite/wallet/')
            .then(response => setWalletDetails(response.data))
            .catch(error => console.error('Failed to fetch wallet details:', error))
    }

    const fetchTransactions = () => {
        apiClient.get('/customersite/customer-wallet/transactions/')
            .then(res => setTransactions(res.data.history))
            .catch(err => console.error("Failed to load transactions", err))
    }

    const verifyPayment = async (sessionId, amount) => {
        setVerifying(true)
        try {
            const response = await apiClient.post('/payment-service/wallet/verify-payment/', {
                session_id: sessionId
            })
            if (response.data.success) {
                setSuccessAmount(amount)
                setShowSuccess(true)
                fetchWalletDetails()
                fetchTransactions()
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                setMessage('Payment verification failed')
            }
        } catch (error) {
            console.error('Payment verification failed:', error)
            setMessage('Payment verification failed')
        } finally {
            setVerifying(false)
        }
    }

    useEffect(() => {
        fetchWalletDetails()
        fetchTransactions()

        const urlParams = new URLSearchParams(window.location.search)
        const success = urlParams.get('success')
        const addedAmount = urlParams.get('amount')
        const sessionId = urlParams.get('session_id')

        if (success === 'true' && addedAmount && sessionId) {
            verifyPayment(sessionId, addedAmount)
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [])

    const handleAddAmount = () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage('Enter a valid amount')
            return
        }

        setLoading(true)
        apiClient.post('/payment-service/wallet/stripe-checkout/', { amount })
            .then(res => window.location.href = res.data.url)
            .catch(err => {
                console.error('Stripe Checkout failed:', err)
                setMessage('Failed to initiate payment')
            })
            .finally(() => setLoading(false))
    }

    return (
        <CustomerLayout>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {verifying && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-blue-800">Verifying payment...</span>
                    </div>
                )}

                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">
                            Successfully added ₹{successAmount} to your wallet!
                        </span>
                    </div>
                )}

                {message && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {message}
                    </div>
                )}


                <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold">Total Balance</h2>
                        <p className="text-3xl font-bold">₹{walletDetails?.account_total_balance ?? '0.00'}</p>
                    </div>
                    <div className="text-sm text-white/90 text-right">
                        Last updated:<br />
                        {walletDetails?.created_at ? new Date(walletDetails.created_at).toLocaleString() : '--'}
                    </div>
                </div>

              
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center space-x-3 mb-4">
                        <Plus className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Add Money</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="number"
                            placeholder="Enter amount"
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <Button
                            onClick={handleAddAmount}
                            disabled={loading || verifying}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Add to Wallet'}
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center space-x-3 mb-4">
                        <Clock className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                    </div>

                    {transactions.length === 0 ? (
                        <p className="text-gray-500 text-center">No transactions found.</p>
                    ) : (
                        <div className="divide-y">
                            {transactions.map(txn => (
                                <div key={txn.id} className="flex justify-between items-center py-3">
                                    <div>
                                        <p className={`font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {txn.amount > 0 ? `+₹${txn.amount}` : `-₹${Math.abs(txn.amount)}`}
                                        </p>
                                        <p className="text-sm text-gray-600">{txn.note || 'No description'}</p>
                                    </div>
                                    <div className="text-sm text-gray-500 text-right">
                                        {new Date(txn.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    )
}

export default CustomerWallet
