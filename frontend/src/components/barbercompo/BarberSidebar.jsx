import React from 'react'
import { Link } from 'react-router-dom'
import Logout from '../basics/Logout'

function BarberSidebar() {
  return (
    <div className="bg-gray-900 text-white w-64 h-screen p-6 fixed left-0 top-0 shadow-lg overflow-y-auto">
      <div className="mb-8">
        <Link to="/barber-dash">
          <h2 className="text-2xl font-bold text-blue-400 border-b border-gray-700 pb-4 hover:text-blue-600 transition">
            Barber Panel
          </h2>
        </Link>
      </div>
      
      <nav className="space-y-3">
        <Link 
          to="/barber-dash" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          Dashboard
        </Link>

        <Link 
          to="/instant-booking/" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          work
        </Link>
        
        <Link 
          to="/barbers-portfolio" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          My Portfolio
        </Link>
        
        <Link 
          to="/barber-earnings" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          Earnings Bag
        </Link>
        
        <Link 
          to="/completed-appointments" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Completed appoiments
        </Link>
        
        <Link 
          to="/barber-slot-booking" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Book Slots
        </Link>
        <Link 
          to="/barber/book-services" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Book Services
        </Link>
        <Link 
          to="/barber/my-services" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          My Services
        </Link>

        <Link 
          to="/barber-profile" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>My Profile</span>
        </Link>

        <Link 
          to="/barber/service-requests" 
          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out group"
        >
          <svg className="w-5 h-5 mr-3 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>My Service Requests</span>
        </Link>

        <div className="pt-4 mt-4 border-t border-purple-300/20">
          <Logout className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600/90 hover:to-red-700/90 text-white/90 hover:text-white border-0 backdrop-blur-sm" />
        </div>        
      </nav>
    </div>
  )
}

export default BarberSidebar