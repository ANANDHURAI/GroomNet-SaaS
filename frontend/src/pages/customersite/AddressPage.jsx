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
      <div className="max-w-6xl mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h6 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">
                My Addresses
              </h6>
              <p className="text-lg text-gray-600">
                Manage your service locations
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Total: <span className="text-green-600 font-bold">{addresses.length}</span>
                </span>
              </div>
              
              {!showForm && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setSelectedAddress(null);
                    setIsEditing(false);
                  }}
                  className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Address
                </button>
              )}
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full"></div>
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8 transform transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedAddress(null);
                  setIsEditing(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
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
          </div>
        )}

    
        {!showForm && addresses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Addresses Yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Add your first address to make booking services faster and easier.
            </p>
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedAddress(null);
                setIsEditing(false);
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Add Your First Address
            </button>
          </div>
        )}

  
        {!showForm && addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {addresses.map((addr, index) => (
              <div
                key={addr.id}
                className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50 rounded-2xl shadow-lg border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
              
                <div className="p-6">
                  <AddressCard
                    address={addr}
                    onSelect={() => {}}
                  />
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl font-medium transition-all duration-200 transform hover:scale-105 border border-blue-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl font-medium transition-all duration-200 transform hover:scale-105 border border-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

               
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </div>

            
                {addr.is_default && (
                  <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18l-8-4a2 2 0 01-1-1.732V5.732a2 2 0 011-1.732l8-4a2 2 0 012 0l8 4a2 2 0 011 1.732v6.536a2 2 0 01-1 1.732l-8 4a2 2 0 01-2 0z" clipRule="evenodd" />
                    </svg>
                    Default
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="text-gray-700 font-medium">Saving address...</p>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default AddressPage;
