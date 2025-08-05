import React from 'react';
import { Scissors, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBadge from '../../components/notification/NotificationBadge';
import { useNotifications } from '../../components/customHooks/useNotifications';

function Navbar() {
  const profileImage = sessionStorage.getItem('customer_profile_image');
  const { totalUnreadCount } = useNotifications();

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-purple-100/50 sticky top-0 z-50 shadow-lg shadow-purple-500/10">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
        
          <div className="flex items-center space-x-4">
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-purple-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <Scissors className="text-white w-7 h-7 relative z-10" />
            </div>
            <div className="flex flex-col">
              <Link to="/home" className="group">
                <span className="text-3xl font-black bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  GroomNet
                </span>
              </Link>
              <span className="text-sm text-gray-500 font-semibold tracking-wide">
                Your Grooming Partner
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <a href="#" className="relative text-gray-700 hover:text-purple-600 font-semibold text-lg transition-all duration-300 group">
              Appointments
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="relative text-gray-700 hover:text-purple-600 font-semibold text-lg transition-all duration-300 group">
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          <div className="flex items-center space-x-5">
          
            <Link to="/booking-history" className="relative p-3 rounded-2xl hover:bg-purple-50 transition-all duration-300 group">
              <Bell className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors duration-300" />
              <NotificationBadge count={totalUnreadCount} />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-300"></div>
            </Link>

            <Link to="/customer-profile" className="relative group">
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 group-hover:scale-110 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:from-purple-100 group-hover:to-pink-100 border-2 border-gray-200 group-hover:border-purple-300 shadow-lg">
                  <User className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
                </div>
              )}
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;