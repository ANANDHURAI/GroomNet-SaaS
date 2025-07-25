import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import { Search, Filter, UserCircle, AlertCircle, CalendarCheck } from 'lucide-react';

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await apiClient.get('/adminsite/complaints/');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiClient.patch(`/adminsite/complaints/${id}/update-status/`, {
        complaint_status: newStatus,
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.complaint_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus ? complaint.complaint_status === filterStatus : true;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="inline text-yellow-500 mr-1" size={16} />;
      case 'UNDER_REVIEW':
        return <AlertCircle className="inline text-orange-500 mr-1" size={16} />;
      case 'ACTION_TAKEN':
        return <AlertCircle className="inline text-blue-500 mr-1" size={16} />;
      case 'RESOLVED':
        return <CalendarCheck className="inline text-green-600 mr-1" size={16} />;
      case 'REJECTED':
        return <AlertCircle className="inline text-red-600 mr-1" size={16} />;
      case 'CLOSED':
        return <AlertCircle className="inline text-gray-600 mr-1" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-indigo-700 flex items-center gap-2 mb-6">
          <AlertCircle className="text-indigo-700" /> Complaints Management
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or title..."
              className="border border-gray-300 pl-10 pr-4 py-2 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-1/4">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="border border-gray-300 pl-10 pr-4 py-2 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm overflow-hidden">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">User</th>
                <th className="p-3 text-left text-sm font-semibold">Complaint</th>
                <th className="p-3 text-left text-sm font-semibold">Status</th>
                <th className="p-3 text-left text-sm font-semibold">Change Status</th>
                <th className="p-3 text-left text-sm font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-100 transition">
                  <td className="p-3 flex items-center gap-2 text-gray-800">
                    <UserCircle size={18} className="text-indigo-600" />
                    {complaint.user.username}
                  </td>
                  <td className="p-3 text-gray-700">{complaint.complaint_name}</td>
                  <td className="p-3 text-sm font-medium">
                    {getStatusIcon(complaint.complaint_status)}
                    {complaint.complaint_status.replace('_', ' ')}
                  </td>
                  <td className="p-3">
                    <select
                      value={complaint.complaint_status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      className="border border-gray-300 px-3 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ACTION_TAKEN">Action Taken</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(complaint.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredComplaints.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No complaints found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Complaints;
