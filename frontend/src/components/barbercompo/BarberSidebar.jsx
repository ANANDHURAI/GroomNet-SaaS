// BarberSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Briefcase,
  Camera,
  DollarSign,
  CheckCircle,
  Calendar,
  Settings,
  User,
  ClipboardList,
  Scissors
} from 'lucide-react';
import Logout from '../basics/Logout';

function BarberSidebar() {
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState(location.pathname);

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { path: '/barber-dash', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/instant-booking/', label: 'Work', icon: Briefcase },
    { path: '/barbers-portfolio', label: 'My Portfolio', icon: Camera },
    { path: '/barber-earnings', label: 'Earnings Bag', icon: DollarSign },
    { path: '/completed-appointments', label: 'Completed Appointments', icon: CheckCircle },
    { path: '/barber-slot-booking', label: 'Book Slots', icon: Calendar },
    { path: '/barber/book-services', label: 'Book Services', icon: Settings },
    { path: '/barber/my-services', label: 'My Services', icon: Scissors },
    { path: '/barber-profile', label: 'My Profile', icon: User },
    { path: '/barber/service-requests', label: 'My Service Requests', icon: ClipboardList }
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

      <div className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-br from-slate-900 via-gray-800 to-blue-900 border-r border-blue-700/50 shadow-2xl backdrop-blur-xl z-50 flex flex-col">
        <div className="p-6 pb-4">
          <Link to="/barber-dash" className="block">
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide group-hover:text-blue-300 transition-colors">GroomNet</h2>
                <p className="text-blue-300 text-sm">Barber Panel</p>
              </div>
            </div>
          </Link>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg"></div>
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
                      ? 'text-white bg-blue-600/30 border-blue-400/50 shadow-xl scale-105 shadow-blue-500/20' 
                      : 'text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 border-transparent hover:border-blue-400/30'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-500/70 shadow-lg shadow-blue-500/30' 
                      : 'bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg'
                  }`}>
                    <Icon className="w-4 h-4 transition-colors" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
            
            <div className="pt-6 mt-6 border-t border-blue-600/30">
              <Logout className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600/90 hover:to-red-700/90 text-white/90 hover:text-white border-0 backdrop-blur-sm rounded-2xl transition-all duration-300 p-4 font-medium hover:shadow-xl hover:scale-105" />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export default BarberSidebar;