import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import {
  BarChart, DollarSign, Users, Scissors, User, AlertCircle,
  Folder, Wrench, CreditCard, FileText, Flame, Star, Crown, Download
} from 'lucide-react';

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

  const downloadReport = async (reportType) => {
    setDownloadingReport(reportType);
    try {
      const response = await apiClient.get(`/report-download-service/reports/${reportType}/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;

      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
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
    { id: 'bookings', title: 'Booking Reports', description: 'Detailed booking analytics and history', icon: <BarChart /> },
    { id: 'revenue', title: 'Revenue Reports', description: 'Financial reports and earnings data', icon: <DollarSign /> },
    { id: 'users', title: 'User Reports', description: 'User registration and activity reports', icon: <Users /> },
    { id: 'services', title: 'Service Reports', description: 'Service performance and popularity', icon: <Scissors /> },
    { id: 'barber-performance', title: 'Barber Performance', description: 'Detailed barber analytics and earnings', icon: <Star /> },
    { id: 'customer-analysis', title: 'Customer Analysis', description: 'Customer behavior and spending patterns', icon: <BarChart /> },
    { id: 'financial-summary', title: 'Financial Summary', description: 'Complete financial overview and metrics', icon: <CreditCard /> }
  ];

  const statIcons = {
    'Total Users': <Users />,
    'Active Barbers': <Scissors />,
    'Customers': <User />,
    'Complaints': <AlertCircle />,
    'Categories': <Folder />,
    'Services': <Wrench />,
    'Platform Earnings': <DollarSign />,
    'Wallet Balance': <CreditCard />
  };

  const statCards = [
    { title: "Total Users", value: totals.users, color: "from-blue-500 to-blue-600" },
    { title: "Active Barbers", value: totals.barbers, color: "from-green-500 to-green-600" },
    { title: "Customers", value: totals.customers, color: "from-purple-500 to-purple-600" },
    { title: "Complaints", value: totals.complaints, color: "from-red-500 to-red-600" },
    { title: "Categories", value: totals.categories, color: "from-yellow-500 to-yellow-600" },
    { title: "Services", value: totals.services, color: "from-indigo-500 to-indigo-600" },
    { title: "Platform Earnings", value: `₹${totals.platform_earnings}`, color: "from-emerald-500 to-emerald-600" },
    { title: "Wallet Balance", value: `₹${totals.admin_wallet_balance}`, color: "from-pink-500 to-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white">
      <div className="w-72">
        <AdminSidebar />
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Monitor your platform's performance and analytics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <div key={idx} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white text-xl`}>
                    {statIcons[card.title]}
                  </div>
                </div>
                <h3 className="text-sm text-gray-300 font-medium uppercase tracking-wide">{card.title}</h3>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FileText className="mr-2" />
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
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Flame className="mr-2" />
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

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star className="mr-2" />
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

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Crown className="mr-2" />
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
