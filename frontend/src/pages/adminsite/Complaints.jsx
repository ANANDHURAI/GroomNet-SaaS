import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';

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

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="p-4 w-full">
        <h2 className="text-2xl font-bold mb-4">Complaints Management</h2>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by user or title..."
            className="border p-2 rounded w-1/2"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded"
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

        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">User</th>
              <th className="p-2">Complaint</th>
              <th className="p-2">Status</th>
              <th className="p-2">Change Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint.id} className="border-t">
                <td className="p-2">{complaint.user.username}</td>
                <td className="p-2">{complaint.complaint_name}</td>
                <td className="p-2 font-semibold">{complaint.complaint_status.replace('_', ' ')}</td>
                <td className="p-2">
                  <select
                    value={complaint.complaint_status}
                    onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ACTION_TAKEN">Action Taken</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </td>
                <td className="p-2">{new Date(complaint.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredComplaints.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No complaints found.</p>
        )}
      </div>
    </div>
  );
}

export default Complaints;
