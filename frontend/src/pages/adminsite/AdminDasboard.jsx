import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';

function AdminDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        apiClient.get('/adminsite/dashboard/admin/')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Dashboard load error:', error);
            });
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-xl animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    const { totals, top_booked_services, top_rating_barbers, top_customers } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex text-white">
            <AdminSidebar />

            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: "Users", value: totals.users },
                        { title: "Barbers", value: totals.barbers },
                        { title: "Customers", value: totals.customers },
                        { title: "Complaints", value: totals.complaints },
                        { title: "Categories", value: totals.categories },
                        { title: "Services", value: totals.services },
                        { title: "Platform Earnings", value: `₹${totals.platform_earnings}` },
                        { title: "Wallet Balance", value: `₹${totals.admin_wallet_balance}` }
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-md">
                            <h2 className="text-sm text-gray-300 uppercase">{card.title}</h2>
                            <p className="text-xl font-semibold mt-1">{card.value}</p>
                        </div>
                    ))}
                </div>

            
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Top Booked Services</h2>
                    <div className="bg-white/10 rounded-xl p-4">
                        <ul className="space-y-2">
                            {top_booked_services.map((s, idx) => (
                                <li key={idx} className="flex justify-between border-b border-white/20 py-2">
                                    <span>{s.service__name}</span>
                                    <span className="font-bold">{s.count} bookings</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Top Rated Barbers</h2>
                    <div className="bg-white/10 rounded-xl p-4">
                        <ul className="space-y-2">
                            {top_rating_barbers.map((b, idx) => (
                                <li key={idx} className="flex justify-between border-b border-white/20 py-2">
                                    <span>{b.barber__name}</span>
                                    <span className="font-bold">{b.avg_rating.toFixed(1)} ★ ({b.review_count} reviews)</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Top Customers</h2>
                    <div className="bg-white/10 rounded-xl p-4">
                        <ul className="space-y-2">
                            {top_customers.map((c, idx) => (
                                <li key={idx} className="flex justify-between border-b border-white/20 py-2">
                                    <span>{c.customer__name}</span>
                                    <span className="font-bold">{c.booking_count} bookings</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
