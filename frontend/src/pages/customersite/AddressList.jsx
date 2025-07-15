import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import { useNavigate } from 'react-router-dom';

function AddressList() {
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/profile-service/addresses/')
      .then(response => setAddresses(response.data))
      .catch(error => console.error('Failed to fetch addresses:', error));
  }, []);

  const handleAddAddress = () => {
    navigate('/add-address');
  };

  const handleEdit = (id) => {
    navigate(`/edit-address/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      apiClient.delete(`/profile-service/addresses/${id}/`)
        .then(() => {
          setAddresses(prev => prev.filter(addr => addr.id !== id));
        })
        .catch(err => {
          console.error('Delete failed:', err);
          alert('Failed to delete address');
        });
    }
  };

  return (
    <CustomerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Addresses</h2>
          <button
            onClick={handleAddAddress}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p>No addresses found.</p>
        ) : (
          <ul className="space-y-4">
            {addresses.map(addr => (
              <li key={addr.id} className="p-4 border rounded shadow-sm bg-white">
                <div className="font-semibold text-lg">{addr.name} ({addr.mobile})</div>
                <div className="text-sm text-gray-700">{addr.building}, {addr.street}</div>
                <div className="text-sm text-gray-700">
                  {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                </div>
                {addr.is_default && (
                  <div className="text-green-600 font-semibold mt-1">Default Address</div>
                )}
                <div className="mt-2 flex gap-4">
                  <button
                    onClick={() => handleEdit(addr.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}

export default AddressList;
