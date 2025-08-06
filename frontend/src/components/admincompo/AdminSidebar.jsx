import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Scissors, 
  Clock, 
  Grid3X3, 
  TicketPercent,
  Wallet, 
  User, 
  Wrench,
  Megaphone 
} from 'lucide-react';
import Logout from '../basics/Logout';

function AdminSidebar() {
  return (
    <div className="w-64 min-h-screen bg-violet-100 border-r border-violet-200 p-6 flex-shrink-0">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-purple-600 tracking-wide">GroomNet</h2>
        <h2 className="text-2xl font-bold text-violet-800 mb-2">Admin Panel</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded"></div>
      </div>
      
      <nav className="space-y-2">

        <Link 
          to="/admin-dashboard" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Users className="w-5 h-5 transition-colors" />
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link 
          to="/customers-list" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Users className="w-5 h-5 transition-colors" />
          <span className="font-medium">Users</span>
        </Link>

        <Link 
          to="/barbers-list" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Scissors className="w-5 h-5 transition-colors" />
          <span className="font-medium">Barbers</span>
        </Link>

        <Link 
          to="/admin-verification" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Clock className="w-5 h-5 transition-colors" />
          <span className="font-medium">Verification Pendings</span>
        </Link>

        <Link 
          to="/category" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Grid3X3 className="w-5 h-5 transition-colors" />
          <span className="font-medium">Categories</span>
        </Link>

        <Link 
          to="/service" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Wrench className="w-5 h-5 transition-colors" />
          <span className="font-medium">Services</span>
        </Link>

        <Link 
          to="/coupons-management" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <TicketPercent className="w-5 h-5 transition-colors" />
          <span className="font-medium">Coupon Management</span>
        </Link>

        <Link 
          to="/customer-complaints-at-admin" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <Megaphone className="w-5 h-5 transition-colors" />
          <span className="font-medium">Complaints</span>
        </Link>

        <Link to="/admin-wallet/">
          <div className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer group">
            <Wallet className="w-5 h-5 transition-colors" />
            <span className="font-medium">Money Bag</span>
          </div>
        </Link>

        <Link 
          to="/admin-profile" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <User className="w-5 h-5 transition-colors" />
          <span className="font-medium">Profile</span>
        </Link>

       
        <Link 
          to="/admin/service-requests" 
          className="flex items-center space-x-3 p-3 rounded-lg text-violet-700 hover:bg-black hover:text-white transition-all duration-200 group"
        >
          <User className="w-5 h-5 transition-colors" />
          <span className="font-medium">Service requests</span>
        </Link>


        <div className="pt-4 mt-4 border-t border-violet-200">
          <Logout className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600/90 hover:to-red-700/90 text-white/90 hover:text-white border-0 backdrop-blur-sm flex items-center justify-center" />
        </div>
      </nav>
    </div>
  );
}

export default AdminSidebar;