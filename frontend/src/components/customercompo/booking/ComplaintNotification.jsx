import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../../slices/api/apiIntercepters';

function ComplaintNotification() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchComplaintUpdates();
    const interval = setInterval(fetchComplaintUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchComplaintUpdates = async () => {
    try {
      const response = await apiClient.get('/customersite/complaints/');
      const complaints = response.data;

      const recentUpdates = complaints.filter(complaint => {
        const updatedDate = new Date(complaint.updated_at);
        const createdDate = new Date(complaint.created_at);
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return updatedDate > sevenDaysAgo && updatedDate.getTime() !== createdDate.getTime();
      });

      setNotifications(recentUpdates);
      setUnreadCount(recentUpdates.length);
    } catch (error) {
      console.warn('Failed to fetch complaint updates:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertTriangle size={16} className="text-orange-600" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return 'is now under review';
      case 'ACTION_TAKEN':
        return 'has been processed - action taken';
      case 'RESOLVED':
        return 'has been resolved';
      case 'REJECTED':
        return 'has been reviewed and rejected';
      case 'CLOSED':
        return 'has been closed by admin';
      default:
        return 'has been updated';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const updatedDate = new Date(dateString);
    const diffInHours = Math.floor((now - updatedDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleNotificationClick = () => {
    setShowDropdown(false);
    setUnreadCount(0);
  };

  if (unreadCount === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Complaint Updates</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.map(complaint => (
              <Link
                key={complaint.id}
                to="/customer/complaints"
                onClick={handleNotificationClick}
                className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(complaint.complaint_status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {complaint.complaint_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Your complaint {getStatusMessage(complaint.complaint_status)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(complaint.updated_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <Link
              to="/customer/complaints"
              onClick={handleNotificationClick}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all complaints →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintNotification;