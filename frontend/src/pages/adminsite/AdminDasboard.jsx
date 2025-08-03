import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';

function AdminDashboard() {
    const [data, setData] = useState(null);
    const [downloadingReport, setDownloadingReport] = useState('');

    useEffect(() => {
        apiClient.get('/adminsite/dashboard/admin/')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Dashboard load error:', error);
            });
    }, []);

    // Report download function
    const downloadReport = async (reportType) => {
        setDownloadingReport(reportType);
        try {
            const response = await apiClient.get(`/report-download-service/reports/${reportType}/`, {
                responseType: 'blob', 
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
  
            const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;

            link.setAttribute('download', filename);
            
            // Append to body and click
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Report download error:', error);
            alert('Failed to download report. Please try again.');
        } finally {
            setDownloadingReport('');
        }
    };

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-xl text-white font-medium">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    const { totals, top_booked_services, top_rating_barbers, top_customers } = data;

    const reportTypes = [
        { 
            id: 'bookings', 
            title: 'Booking Reports', 
            description: 'Detailed booking analytics and history',
            icon: '📊'
        },
        { 
            id: 'revenue', 
            title: 'Revenue Reports', 
            description: 'Financial reports and earnings data',
            icon: '💰'
        },
        { 
            id: 'users', 
            title: 'User Reports', 
            description: 'User registration and activity reports',
            icon: '👥'
        },
        { 
            id: 'services', 
            title: 'Service Reports', 
            description: 'Service performance and popularity',
            icon: '✂️'
        },
        { 
            id: 'barber-performance', 
            title: 'Barber Performance', 
            description: 'Detailed barber analytics and earnings',
            icon: '🏆'
        },
        { 
            id: 'customer-analysis', 
            title: 'Customer Analysis', 
            description: 'Customer behavior and spending patterns',
            icon: '📈'
        },
        { 
            id: 'financial-summary', 
            title: 'Financial Summary', 
            description: 'Complete financial overview and metrics',
            icon: '💳'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white">
            <AdminSidebar />

            <div className="flex-1 p-6 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">Monitor your platform's performance and analytics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: "Total Users", value: totals.users, icon: "👥", color: "from-blue-500 to-blue-600" },
                        { title: "Active Barbers", value: totals.barbers, icon: "✂️", color: "from-green-500 to-green-600" },
                        { title: "Customers", value: totals.customers, icon: "👤", color: "from-purple-500 to-purple-600" },
                        { title: "Complaints", value: totals.complaints, icon: "⚠️", color: "from-red-500 to-red-600" },
                        { title: "Categories", value: totals.categories, icon: "📁", color: "from-yellow-500 to-yellow-600" },
                        { title: "Services", value: totals.services, icon: "🛠️", color: "from-indigo-500 to-indigo-600" },
                        { title: "Platform Earnings", value: `₹${totals.platform_earnings}`, icon: "💰", color: "from-emerald-500 to-emerald-600" },
                        { title: "Wallet Balance", value: `₹${totals.admin_wallet_balance}`, icon: "💳", color: "from-pink-500 to-pink-600" }
                    ].map((card, idx) => (
                        <div key={idx} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
                            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-2xl`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <h3 className="text-sm text-gray-300 font-medium uppercase tracking-wide">{card.title}</h3>
                                <p className="text-2xl font-bold mt-2">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reports Download Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="mr-3">📄</span>
                        Download Reports
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {reportTypes.map((report) => (
                            <div key={report.id} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl blur"></div>
                                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all duration-300 min-h-[180px] flex flex-col">
                                    <div className="text-3xl mb-3">{report.icon}</div>
                                    <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 flex-grow">{report.description}</p>
                                    <button
                                        onClick={() => downloadReport(report.id)}
                                        disabled={downloadingReport === report.id}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center mt-auto"
                                    >
                                        {downloadingReport === report.id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">⬇️</span>
                                                Download
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Booked Services */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-3">🔥</span>
                            Top Booked Services
                        </h2>
                        <div className="space-y-3">
                            {top_booked_services.map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium">{service.service__name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-purple-400">{service.count}</div>
                                        <div className="text-xs text-gray-400">bookings</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Rated Barbers */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-3">⭐</span>
                            Top Rated Barbers
                        </h2>
                        <div className="space-y-3">
                            {top_rating_barbers.map((barber, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium">{barber.barber__name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-yellow-400">{barber.avg_rating.toFixed(1)} ⭐</div>
                                        <div className="text-xs text-gray-400">({barber.review_count} reviews)</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-3">👑</span>
                            Top Customers
                        </h2>
                        <div className="space-y-3">
                            {top_customers.map((customer, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium">{customer.customer__name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-400">{customer.booking_count}</div>
                                        <div className="text-xs text-gray-400">bookings</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;