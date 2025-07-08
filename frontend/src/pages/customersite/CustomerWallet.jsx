import React, { useEffect, useState } from 'react'
import { Button } from '../../components/mini ui/Button'
import apiClient from '../../slices/api/apiIntercepters'
import { Check, Wallet, Plus } from 'lucide-react'
import CustomerLayout from '../../components/customercompo/CustomerLayout'

function CustomerWallet() {
    const [amount, setAmount] = useState('')
    const [walletDetails, setWalletDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successAmount, setSuccessAmount] = useState('')
    const [verifying, setVerifying] = useState(false)

    const fetchWalletDetails = () => {
        apiClient.get('/customersite/wallet/')
            .then(response => {
                setWalletDetails(response.data)
            })
            .catch(error => {
                console.error('Failed to fetch wallet details:', error)
            })
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
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                alert('Payment verification failed')
            }
        } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed')
        } finally {
            setVerifying(false)
        }
    }

    useEffect(() => {
        fetchWalletDetails()
        
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
            alert("Enter a valid amount")
            return
        }

        setLoading(true)
        apiClient.post('/payment-service/wallet/stripe-checkout/', { amount })
            .then(res => {
                window.location.href = res.data.url
            })
            .catch(err => {
                console.error('Stripe Checkout failed:', err)
                alert('Failed to initiate payment')
            })
            .finally(() => setLoading(false))
    }

    return (
        <CustomerLayout>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {verifying && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-blue-800">
                            Verifying payment...
                        </span>
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

                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center space-x-3 mb-4">
                        <Wallet className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Wallet Balance</h2>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                        ₹{walletDetails?.account_total_balance ?? 'Loading...'}
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Wallet Details</h3>
                    
                    {walletDetails ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Wallet ID:</span>
                                <span className="font-medium text-gray-800">{walletDetails.id}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(walletDetails.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Loading wallet details...</p>
                    )}
                </div>
            </div>
        </CustomerLayout>
    )
}

export default CustomerWallet