import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Eye, CheckCircle, XCircle, Lock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../../slices/api/apiIntercepters';

function ComplaintStatus({ bookingId }) {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaintStatus();
  }, [bookingId]);

  const fetchComplaintStatus = async () => {
    try {
      const response = await apiClient.get(`/customersite/complaints/?booking=${bookingId}`);
      if (response.data && response.data.length > 0) {
        setComplaint(response.data[0]);
      }
    } catch (error) {
      console.warn('No complaint found for this booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} className="text-yellow-600" />;
      case 'UNDER_REVIEW':
        return <Eye size={16} className="text-blue-600" />;
      case 'ACTION_TAKEN':
        return <AlertTriangle size={16} className="text-orange-600" />;
      case 'RESOLVED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      case 'CLOSED':
        return <Lock size={16} className="text-gray-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Complaint Status</h4>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.complaint_status)}`}>
          {getStatusIcon(complaint.complaint_status)}
          {getStatusText(complaint.complaint_status)}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <h5 className="font-medium text-gray-800">{complaint.complaint_name}</h5>
          <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
        </div>

        {complaint.image && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Attached Image:</p>
            <img 
              src={complaint.image} 
              alt="Complaint attachment" 
              className="max-w-full h-32 object-cover rounded-md border border-gray-200"
            />
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="space-y-1">
            <div>Submitted: {formatDate(complaint.created_at)}</div>
            {complaint.updated_at !== complaint.created_at && (
              <div>Updated: {formatDate(complaint.updated_at)}</div>
            )}
          </div>
          <Link 
            to="/customer/complaints"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View All <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ComplaintStatus;