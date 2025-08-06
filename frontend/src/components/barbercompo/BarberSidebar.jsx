// BarberSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
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
  return (
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
      
    
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <nav className="space-y-2">
          <Link 
            to="/barber-dash" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <LayoutDashboard className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link 
            to="/instant-booking/" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <Briefcase className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Work</span>
          </Link>
          
          <Link 
            to="/barbers-portfolio" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <Camera className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">My Portfolio</span>
          </Link>
          
          <Link 
            to="/barber-earnings" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <DollarSign className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Earnings Bag</span>
          </Link>
          
          <Link 
            to="/completed-appointments" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <CheckCircle className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Completed Appointments</span>
          </Link>
          
          <Link 
            to="/barber-slot-booking" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <Calendar className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Book Slots</span>
          </Link>

          <Link 
            to="/barber/book-services" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <Settings className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">Book Services</span>
          </Link>

          <Link 
            to="/barber/my-services" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <Scissors className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">My Services</span>
          </Link>

          <Link 
            to="/barber-profile" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <User className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">My Profile</span>
          </Link>

          <Link 
            to="/barber/service-requests" 
            className="flex items-center space-x-3 p-4 rounded-2xl text-blue-200 hover:text-white hover:bg-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300 group backdrop-blur-sm border border-transparent hover:border-blue-400/30"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-700/50 group-hover:bg-blue-600/70 group-hover:shadow-lg transition-all duration-300">
              <ClipboardList className="w-4 h-4 transition-colors" />
            </div>
            <span className="font-medium">My Service Requests</span>
          </Link>

         
          <div className="pt-6 mt-6 border-t border-blue-600/30">
            <Logout className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600/90 hover:to-red-700/90 text-white/90 hover:text-white border-0 backdrop-blur-sm rounded-2xl transition-all duration-300 p-4 font-medium hover:shadow-xl hover:scale-105" />
          </div>
        </nav>
      </div>
    </div>
  );
}

export default BarberSidebar;