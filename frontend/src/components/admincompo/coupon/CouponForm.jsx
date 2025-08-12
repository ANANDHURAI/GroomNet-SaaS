import React, { useState, useEffect } from 'react';
import apiClient from '../../../slices/api/apiIntercepters';

function CouponForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    code: '',
    service: '',
    discount_percentage: '',
    expiry_date: '',
  });

  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/adminsite/services/').then((res) => setServices(res.data));
  }, []);

  useEffect(() => {
    if (initialData?.id) {
      setFormData(initialData);
    } else {
      setFormData({
        code: '',
        service: '',
        discount_percentage: '',
        expiry_date: '',
      });
    }
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // clear error on input change
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.service || !formData.discount_percentage || !formData.expiry_date) {
      setError("All fields are required.");
      return;
    }

    if (Number(formData.discount_percentage) > 50) {
      setError("Maximum discount percentage is 50.");
      return;
    }

    setError('');
    onSubmit(formData, !!initialData?.id);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{initialData?.id ? 'Edit' : 'Create'} Coupon</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <input
          type="text"
          name="code"
          placeholder="Coupon Code"
          value={formData.code}
          onChange={handleChange}
          className="w-full mb-3 border p-2 rounded"
        />
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full mb-3 border p-2 rounded"
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="discount_percentage"
          placeholder="Discount %"
          value={formData.discount_percentage}
          onChange={handleChange}
          className="w-full mb-3 border p-2 rounded"
        />
        <input
          type="datetime-local"
          name="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
          className="w-full mb-4 border p-2 rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {initialData?.id ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CouponForm;
