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
    const res = await apiClient.get('/adminsite/coupons/');
    setCoupons(res.data);
    setFiltered(res.data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    const filtered = coupons.filter((c) =>
      c.code.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filtered);
  };

  const handleCreateOrUpdate = async (data, isEdit = false) => {
    if (isEdit) {
      await apiClient.put(`/adminsite/coupons/${data.id}/`, data);
    } else {
      await apiClient.post('/adminsite/coupons/', data);
    }
    fetchCoupons();
    setEditingCoupon(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this coupon?")) {
      await apiClient.delete(`/adminsite/coupons/${id}/`);
      fetchCoupons();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Coupon Management</h2>

        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-1/3"
          />
          <button
            onClick={() => setEditingCoupon({})}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            + Add Coupon
          </button>
        </div>

        <CouponTable
          coupons={filtered}
          onEdit={setEditingCoupon}
          onDelete={handleDelete}
        />

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
