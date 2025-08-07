import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import CouponForm from '../../components/admincompo/coupon/CouponForm';
import CouponTable from '../../components/admincompo/coupon/CouponTable';

function CouponManagePage() {
  const [coupons, setCoupons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);

  const fetchCoupons = async () => {
    try {
      const res = await apiClient.get('/adminsite/coupons/');
      const dataWithStatus = res.data.map(coupon => {
        const now = new Date();
        const isExpired = new Date(coupon.expiry_date) < now;
        return {
          ...coupon,
          status: !coupon.is_active ? 'Inactive' : isExpired ? 'Expired' : 'Active',
        };
      });
      setCoupons(dataWithStatus);
      setFiltered(dataWithStatus);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    const filtered = coupons.filter(c =>
      c.code.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filtered);
  };

  const handleCreateOrUpdate = async (data, isEdit = false) => {
    try {
      if (isEdit) {
        await apiClient.put(`/adminsite/coupons/${data.id}/`, data);
      } else {
        await apiClient.post('/adminsite/coupons/', data);
      }
      fetchCoupons();
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error saving coupon', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this coupon?')) {
      try {
        await apiClient.delete(`/adminsite/coupons/${id}/`);
        fetchCoupons();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-72">
        <AdminSidebar />
      </div>
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Coupon Management</h2>
          <button
            onClick={() => setEditingCoupon({})}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            + Add Coupon
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-1/3"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <CouponTable
            coupons={filtered}
            onEdit={setEditingCoupon}
            onDelete={handleDelete}
          />
        </div>

        {editingCoupon !== null && (
          <CouponForm
            initialData={editingCoupon}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setEditingCoupon(null)}
          />
        )}
      </div>
    </div>
  );

}

export default CouponManagePage;
