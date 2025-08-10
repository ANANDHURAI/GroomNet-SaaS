import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Eye, CheckCircle, XCircle, Lock, Calendar, User, FileText } from 'lucide-react';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import apiClient from '../../slices/api/apiIntercepters';

function CustomerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchCustomerComplaints();
  }, []);

  const fetchCustomerComplaints = async () => {
    try {
      const response = await apiClient.get('/customersite/complaints/');
      setComplaints(response.data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 20 };
    switch (status) {
      case 'PENDING':
        return <Clock {...iconProps} className="text-yellow-600" />;
      case 'UNDER_REVIEW':
        return <Eye {...iconProps} className="text-blue-600" />;
      case 'ACTION_TAKEN':
        return <AlertTriangle {...iconProps} className="text-orange-600" />;
      case 'RESOLVED':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle {...iconProps} className="text-red-600" />;
      case 'CLOSED':
        return <Lock {...iconProps} className="text-gray-600" />;
      default:
        return <Clock {...iconProps} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACTION_TAKEN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Review';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'ACTION_TAKEN':
        return 'Action Taken';
      case 'RESOLVED':
        return 'Resolved';
      case 'REJECTED':
        return 'Rejected';
      case 'CLOSED':
        return 'Closed by Admin';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ComplaintCard = ({ complaint }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedComplaint(complaint)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{complaint.complaint_name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ml-4 ${getStatusColor(complaint.complaint_status)}`}>
          {getStatusIcon(complaint.complaint_status)}
          {getStatusText(complaint.complaint_status)}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(complaint.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <FileText size={14} />
            Booking #{complaint.booking}
          </span>
        </div>
        <span className="text-indigo-600 hover:text-indigo-800">View Details →</span>
      </div>
    </div>
  );

  const ComplaintDetailModal = ({ complaint, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Complaint Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{complaint.complaint_name}</h3>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(complaint.complaint_status)}`}>
              {getStatusIcon(complaint.complaint_status)}
              {getStatusText(complaint.complaint_status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>Submitted: {formatDate(complaint.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText size={16} />
              <span>Booking ID: #{complaint.booking}</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Attached Image</h4>
            {complaint.image ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${complaint.image}`}
                alt="Complaint attachment"
                className="max-w-full h-64 object-contain rounded-lg border border-gray-200"
              />
            ) : (
              <p className="text-gray-600 italic">No image for this complaint.</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Status Information</h4>
            <div className="space-y-2 text-sm text-blue-800">
              {complaint.complaint_status === 'PENDING' && (
                <p>Your complaint is pending review. Our team will review it within 24-48 hours.</p>
              )}
              {complaint.complaint_status === 'UNDER_REVIEW' && (
                <p>Our team is currently reviewing your complaint. We'll update you soon with our findings.</p>
              )}
              {complaint.complaint_status === 'ACTION_TAKEN' && (
                <p>We have taken action based on your complaint. Thank you for bringing this to our attention.</p>
              )}
              {complaint.complaint_status === 'RESOLVED' && (
                <p>Your complaint has been resolved. If you have any further concerns, please contact our support team.</p>
              )}
              {complaint.complaint_status === 'REJECTED' && (
                <p>After review, we were unable to validate your complaint. If you believe this is an error, please contact support.</p>
              )}
              {complaint.complaint_status === 'CLOSED' && (
                <p>This complaint has been closed by our admin team. No further action will be taken.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">My Complaints</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">My Complaints</h2>
          <div className="text-sm text-gray-600">
            Total: {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
          </div>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
            <p className="text-gray-600">You haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map(complaint => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}

        {selectedComplaint && (
          <ComplaintDetailModal
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
          />
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerComplaintsPage;