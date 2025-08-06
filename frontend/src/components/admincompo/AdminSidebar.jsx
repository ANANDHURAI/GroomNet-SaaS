// AdminSidebar.jsx
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
  Megaphone,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import Logout from '../basics/Logout';

function AdminSidebar() {
  return (
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
      
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <nav className="space-y-2">
          <Link 
            to="/admin-dashboard" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <LayoutDashboard className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link 
            to="/customers-list" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Users className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Users</span>
          </Link>

          <Link 
            to="/barbers-list" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Scissors className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Barbers</span>
          </Link>

          <Link 
            to="/admin-verification" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Clock className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Verification Pendings</span>
          </Link>

          <Link 
            to="/category" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Grid3X3 className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Categories</span>
          </Link>

          <Link 
            to="/service" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Wrench className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Services</span>
          </Link>

          <Link 
            to="/coupons-management" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <TicketPercent className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Coupon Management</span>
          </Link>

          <Link 
            to="/customer-complaints-at-admin" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Megaphone className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Complaints</span>
          </Link>

          <Link 
            to="/admin-wallet/"
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <Wallet className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Money Bag</span>
          </Link>

          <Link 
            to="/admin-profile" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <User className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Profile</span>
          </Link>

          <Link 
            to="/admin/service-requests" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-purple-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-purple-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-700/50 group-hover:bg-purple-600/70 group-hover:shadow-lg transition-all duration-300">
              <ClipboardList className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Service Requests</span>
          </Link>

          <div className="pt-6 mt-6 border-t border-purple-600/30">
            <Logout className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl hover:scale-105 border-0 backdrop-blur-sm flex items-center justify-center rounded-2xl transition-all duration-300 p-4 font-medium" />
          </div>
        </nav>
      </div>
    </div>
  );
}

export default AdminSidebar;