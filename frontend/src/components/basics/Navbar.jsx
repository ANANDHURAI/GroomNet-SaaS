import React from 'react';
import { Scissors, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import NotificationBadge from '../../components/notification/NotificationBadge';
import { useNotifications } from '../../components/customHooks/useNotifications';


function Navbar() {
  const profileImage = sessionStorage.getItem('customer_profile_image');
  const { totalUnreadCount } = useNotifications();


  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
              <Scissors className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Link to="/home">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  GroomNet
                </span>
              </Link>
              <span className="text-xs text-gray-500 font-medium">
                Your Grooming Partner
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Appointments</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Services</a>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/booking-history" className="relative p-2">
              <Bell className="w-6 h-6 text-gray-700" />
              <NotificationBadge count={totalUnreadCount} />
            </Link>

            <Link to="/customer-profile" className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-300 hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </Link>

            <Logout />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;