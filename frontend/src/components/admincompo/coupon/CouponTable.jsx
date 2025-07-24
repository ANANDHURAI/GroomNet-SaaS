import React from 'react';

function CouponTable({ coupons, onEdit, onDelete }) {
  return (
    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead className="bg-gray-100 text-left text-sm uppercase text-gray-600">
        <tr>
          <th className="p-4">Code</th>
          <th className="p-4">Service</th>
          <th className="p-4">Discount (%)</th>
          <th className="p-4">Expiry Date</th>
          <th className="p-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {coupons.map((coupon) => (
          <tr key={coupon.id} className="border-b hover:bg-gray-50">
            <td className="p-4">{coupon.code}</td>
            <td className="p-4">{coupon.service}</td>
            <td className="p-4">{coupon.discount_percentage}%</td>
            <td className="p-4">{new Date(coupon.expiry_date).toLocaleDateString()}</td>
            <td className="p-4 text-center space-x-2">
              <button
                onClick={() => onEdit(coupon)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(coupon.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CouponTable;
