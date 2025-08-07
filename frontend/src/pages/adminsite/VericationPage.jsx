import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import RequestCard from '../../components/admincompo/RequestCard';
import DocumentModal from '../../components/admincompo/DocumentModal';
import EmptyState from '../../components/admincompo/EmptyState';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import TabNavigation from '../../components/admincompo/TabNavigation';
import { ConfirmationModal } from '../../components/admincompo/serviceCom/ConfirmationModal';

function VerificationPage() {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const [pendingResponse, allResponse] = await Promise.all([
                apiClient.get('adminsite/pending-requests/'),
                apiClient.get('adminsite/all-requests/')
            ]);
            
            setPendingRequests(pendingResponse.data);
            setAllRequests(allResponse.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
           
            alert('Failed to fetch requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action, comment = '') => {
        try {
            setActionLoading(true);
            await apiClient.post('adminsite/approve-barber/', {
                user_id: userId,
                action: action,
                comment: comment
            });
            
            
            await fetchRequests();
            
            alert(`Request ${action}d successfully!`);
        } catch (error) {
            console.error(`Failed to ${action} request:`, error);
            alert(`Failed to ${action} request. Please try again.`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = (userId) => {
        setConfirmAction({ type: 'approve', userId });
        setConfirmModalOpen(true);
    };

    const handleReject = (userId, comment) => {
        setConfirmAction({ type: 'reject', userId, comment });
        setConfirmModalOpen(true);
    };

    const handleConfirmAction = () => {
        if (!confirmAction) return;

        const { userId, type, comment = '' } = confirmAction;
        handleAction(userId, type, comment);
        setConfirmModalOpen(false);
        setConfirmAction(null);
    };

    const viewDocuments = async (barberId) => {
        try {
            const response = await apiClient.get(`adminsite/verification-barber-details/${barberId}/`);
            setSelectedBarber(response.data);
        } catch (error) {
            console.error('Failed to fetch barber details:', error);
            alert('Failed to load barber details. Please try again.');
        }
    };

    const closeModal = () => {
        setSelectedBarber(null);
    };

    const tabs = [
        {
            id: 'pending',
            label: 'Pending Requests',
            count: pendingRequests.length
        },
        {
            id: 'all',
            label: 'Verified Requests',
            count: allRequests.length
        }
    ];

    const renderRequestsList = () => {
        const requests = activeTab === 'pending' ? pendingRequests : allRequests;
        const showActions = activeTab === 'pending';

        if (loading) {
            return <LoadingSpinner text="Loading requests..." />;
        }

        if (requests.length === 0) {
            return (
                <EmptyState 
                    icon={activeTab === 'pending' ? '📋' : '📄'}
                    title={activeTab === 'pending' ? 'No pending requests' : 'No requests found'}
                    description={
                        activeTab === 'pending' 
                            ? 'All verification requests have been processed.' 
                            : 'No verification requests have been submitted yet.'
                    }
                />
            );
        }

        return (
            <div className="space-y-4">
                {requests.map(barber => (
                    <RequestCard
                        key={barber.id}
                        barber={barber}
                        onViewDocuments={viewDocuments}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        showActions={showActions}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <div className="w-72">
                <AdminSidebar />
            </div>
            
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Barber Verification</h1>
                        <button 
                            onClick={fetchRequests}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                    
                    <TabNavigation 
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tabs={tabs}
                    />

                    {renderRequestsList()}

                    <DocumentModal 
                        barber={selectedBarber}
                        onClose={closeModal}
                    />
                    <ConfirmationModal
                        isOpen={confirmModalOpen}
                        onClose={() => setConfirmModalOpen(false)}
                        onConfirm={handleConfirmAction}
                        title={`Confirm ${confirmAction?.type === 'approve' ? 'Approval' : 'Rejection'}`}
                        message={`Are you sure you want to ${confirmAction?.type} this barber request?`}
                        confirmText={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
                        cancelText="Cancel"
                        confirmColor={confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    />

                   
                    {actionLoading && (
                        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
                            <div className="bg-white rounded-lg p-6">
                                <LoadingSpinner size="small" text="Processing request..." />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerificationPage;