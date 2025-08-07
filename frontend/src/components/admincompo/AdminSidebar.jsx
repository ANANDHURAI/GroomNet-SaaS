// AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Scissors, 
  Clock, 
  Grid3X3, 
  TicketPercent,
  Wallet, 
  User, 
  Wrench,
  Megaphone,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import Logout from '../basics/Logout';

function AdminSidebar() {
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState(location.pathname);

  // Update active route when location changes
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers-list', label: 'Users', icon: Users },
    { path: '/barbers-list', label: 'Barbers', icon: Scissors },
    { path: '/admin-verification', label: 'Verification Pendings', icon: Clock },
    { path: '/category', label: 'Categories', icon: Grid3X3 },
    { path: '/service', label: 'Services', icon: Wrench },
    { path: '/coupons-management', label: 'Coupon Management', icon: TicketPercent },
    { path: '/customer-complaints-at-admin', label: 'Complaints', icon: Megaphone },
    { path: '/admin-wallet/', label: 'Money Bag', icon: Wallet },
    { path: '/admin-profile', label: 'Profile', icon: User },
    { path: '/admin/service-requests', label: 'Service Requests', icon: ClipboardList }
  ];

  return (
    <>
      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 border-r border-purple-700/50 shadow-2xl backdrop-blur-xl z-50 flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">GroomNet</h2>
              <p className="text-purple-300 text-sm">Admin Panel</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full shadow-lg"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 group backdrop-blur-sm border ${
                    isActive 
                      ? 'text-white bg-purple-600/30 border-purple-400/50 shadow-xl scale-105 shadow-purple-500/20' 
                      : 'text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 border-transparent hover:border-purple-400/30'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-purple-500/70 shadow-lg shadow-purple-500/30' 
                      : 'bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg'
                  }`}>
                    <Icon className="w-4 h-4 transition-colors" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}

            <div className="pt-6 mt-6 border-t border-purple-600/30">
              <Logout className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl hover:scale-105 border-0 backdrop-blur-sm flex items-center justify-center rounded-2xl transition-all duration-300 p-4 font-medium" />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;