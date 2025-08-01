import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import AddressCard from '../../components/customercompo/addresscomponents/AddressCard';
import AddressForm from '../../components/customercompo/addresscomponents/AddressForm';

function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = () => {
    apiClient
      .get('/profile-service/addresses/')
      .then((res) => setAddresses(res.data))
      .catch(() => alert('Failed to load addresses'));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);


  const handleSave = (formData, resetForm) => {
    setSaving(true);
    const method = isEditing ? apiClient.put : apiClient.post;
    const url = isEditing
      ? `/profile-service/addresses/${selectedAddress.id}/`
      : '/profile-service/addresses/';

    method(url, formData)
      .then(() => {
        setShowForm(false);
        setSelectedAddress(null);
        setIsEditing(false);
        resetForm();
        fetchAddresses();
      })
      .catch(() => alert('Save failed'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      apiClient
        .delete(`/profile-service/addresses/${id}/`)
        .then(() => fetchAddresses())
        .catch(() => alert('Delete failed'));
    }
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setShowForm(true);
    setIsEditing(true);
  };

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Addresses</h2>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedAddress(null);
                setIsEditing(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Address
            </button>
          )}
        </div>

        {showForm && (
          <AddressForm
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setSelectedAddress(null);
              setIsEditing(false);
            }}
            saving={saving}
            key={isEditing ? selectedAddress?.id : 'new'}
            defaultData={selectedAddress}
          />
        )}

        {!showForm && addresses.length === 0 && (
          <div className="text-gray-500">No addresses found.</div>
        )}

        {!showForm && (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="relative group">
                <AddressCard
                  address={addr}
                  onSelect={() => {}}
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default AddressPage;
