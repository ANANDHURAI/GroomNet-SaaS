import React from 'react';
import { Scissors, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBadge from '../../components/notification/NotificationBadge';
import { useNotifications } from '../../components/customHooks/useNotifications';

function Navbar() {
  const profileImage = sessionStorage.getItem('customer_profile_image');
  const { totalUnreadCount } = useNotifications();

  return (
    <nav className="bg-white/80 backdrop-blur-2xl border-b border-purple-100/50 sticky top-0 z-50 shadow-2xl shadow-purple-500/10">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                <Scissors className="text-white w-8 h-8 relative z-10 transform transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <Link to="/home" className="group">
                <span className="text-4xl font-black bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform group-hover:scale-105">
                  GroomNet
                </span>
              </Link>
              <span className="text-sm text-gray-500 font-bold tracking-wider">
                Your Grooming Partner
              </span>
            </div>
          </div>

      
          <div className="hidden md:flex items-center space-x-12">
            <Link to="/about" className="relative text-gray-700 hover:text-purple-600 font-bold text-lg transition-all duration-300 group">
              About Us
              <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            
            <Link to="/booking-history" className="relative group">
              <div className="relative p-4 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl border border-white/30">
                <Bell className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors duration-300" />
                <NotificationBadge count={totalUnreadCount} />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all duration-300"></div>
              </div>
            </Link>

            <Link to="/customer-profile" className="relative group">
              {profileImage ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                  <img
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="relative w-14 h-14 rounded-2xl object-cover border-3 border-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:from-purple-200 group-hover:to-pink-200 border-3 border-white shadow-2xl">
                    <User className="w-7 h-7 text-purple-600 transition-colors duration-300" />
                  </div>
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
