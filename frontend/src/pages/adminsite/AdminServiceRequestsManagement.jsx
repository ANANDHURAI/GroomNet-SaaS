import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Timer,
  MessageSquare
} from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';


const AdminServiceRequestsManagement = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchServiceRequests();
    fetchStats();
    fetchCategories();
  }, [statusFilter, categoryFilter]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      const response = await apiClient.get(`/adminsite/service-requests/?${params}`);
      setServiceRequests(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching service requests:', error);
      setError('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/adminsite/service-request/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/adminsite/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    setProcessing(true);
    try {
      const endpoint = actionType === 'approve'
        ? `/adminsite/service-requests/${selectedRequest.id}/approve/`
        : `/adminsite/service-requests/${selectedRequest.id}/reject/`;

      await apiClient.post(endpoint, { admin_notes: adminNotes });

      await fetchServiceRequests();
      await fetchStats();
      setShowActionModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setActionType('');
    } catch (error) {
      console.error(`Error ${actionType}ing request:`, error);
      setError(`Failed to ${actionType} request`);
    } finally {
      setProcessing(false);
    }
  };

  const openActionModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes('');
    setShowActionModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredRequests = serviceRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.barber_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Requests Management</h1>
            <p className="text-gray-600">Review and manage barber service requests</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <StatsCard label="Total" value={stats.total || 0} icon={<Eye className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
            <StatsCard label="Pending" value={stats.pending || 0} icon={<Clock className="w-6 h-6 text-yellow-600" />} bg="bg-yellow-100" />
            <StatsCard label="Approved" value={stats.approved || 0} icon={<CheckCircle className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
            <StatsCard label="Rejected" value={stats.rejected || 0} icon={<XCircle className="w-6 h-6 text-red-600" />} bg="bg-red-100" />
            <StatsCard label="This Week" value={stats.recent_requests || 0} icon={<Calendar className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <SearchInput value={searchTerm} onChange={setSearchTerm} />
              <SelectFilter value={statusFilter} onChange={setStatusFilter} options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]} />
              <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Service Details', 'Barber', 'Category', 'Price/Duration', 'Status', 'Date', 'Actions'].map((title, idx) => (
                        <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500">{request.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.barber_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{request.category_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">₹{request.price} / {request.duration} min</td>
                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 space-x-2">
                          <button
                            onClick={() => { setShowDetailModal(true); setSelectedRequest(request); }}
                            className="text-blue-600 hover:underline text-sm"
                          >View</button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal(request, 'approve')}
                                className="text-green-600 hover:underline text-sm"
                              >Approve</button>
                              <button
                                onClick={() => openActionModal(request, 'reject')}
                                className="text-red-600 hover:underline text-sm"
                              >Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showDetailModal && selectedRequest && (
            <Modal onClose={() => setShowDetailModal(false)} title="Service Request Details">
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>Barber:</strong> {selectedRequest.barber_name}</p>
              <p><strong>Category:</strong> {selectedRequest.category_name}</p>
              <p><strong>Price:</strong> ₹{selectedRequest.price}</p>
              <p><strong>Duration:</strong> {selectedRequest.duration} min</p>
              <p><strong>Description:</strong> {selectedRequest.description}</p>
            </Modal>
          )}

          {showActionModal && (
            <Modal onClose={() => setShowActionModal(false)} title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Request`}>
              <textarea
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Add admin notes (optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >Cancel</button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 rounded-md text-white ${actionType === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon, bg }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${bg}`}>
        {icon}
      </div>
    </div>
  </div>
);

const SearchInput = ({ value, onChange }) => (
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="text"
      placeholder="Search by service name or barber..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const SelectFilter = ({ value, onChange, options }) => (
  <div className="relative">
    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
      >✕</button>
    </div>
  </div>
);

export default AdminServiceRequestsManagement;
