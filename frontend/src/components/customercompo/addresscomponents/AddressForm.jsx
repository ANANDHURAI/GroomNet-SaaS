import React, { useEffect, useState } from 'react';

const AddressForm = ({ onSave, onCancel, saving, defaultData }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    building: '',
    street: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  // If defaultData is provided (edit mode), pre-fill the form
  useEffect(() => {
    if (defaultData) {
      setFormData({
        name: defaultData.name || '',
        mobile: defaultData.mobile || '',
        building: defaultData.building || '',
        street: defaultData.street || '',
        city: defaultData.city || '',
        district: defaultData.district || '',
        state: defaultData.state || '',
        pincode: defaultData.pincode || '',
        is_default: defaultData.is_default || false,
      });
    }
  }, [defaultData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, () => {
      // Reset form after save (for new address only)
      setFormData({
        name: '',
        mobile: '',
        building: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        is_default: false,
      });
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 mt-4 shadow">
      <h2 className="text-lg font-semibold mb-4">
        {defaultData ? 'Edit Address' : 'Add New Address'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number *"
            value={formData.mobile}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <input
          type="text"
          name="building"
          placeholder="Building/House No."
          value={formData.building}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
        />

        <input
          type="text"
          name="street"
          placeholder="Street/Area"
          value={formData.street}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="city"
            placeholder="City *"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="district"
            placeholder="District"
            value={formData.district}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_default"
            checked={formData.is_default}
            onChange={handleInputChange}
            className="mr-2 w-4 h-4"
          />
          <label className="text-sm text-gray-600">Set as default address</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 rounded-lg p-3 font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-lg p-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : defaultData ? 'Update Address' : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
