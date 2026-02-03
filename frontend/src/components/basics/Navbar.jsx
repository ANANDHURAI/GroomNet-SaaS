import { useState, useEffect } from 'react'; 
import { Scissors, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBadge from '../../components/notification/NotificationBadge'; // Ensure path is correct
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useSelector } from "react-redux";

function Navbar() {
  const user = useSelector(state => state.login.user);
  const registerUser = useSelector(state => state.register?.user);
  const currentUser = user || registerUser;

  const { totalUnreadCount } = useNotificationContext();

  const [displayImage, setDisplayImage] = useState(
    sessionStorage.getItem('customer_profile_image') || 
    currentUser?.profile_image || 
    currentUser?.profileimage
  );

  useEffect(() => {
    const reduxImg = currentUser?.profile_image || currentUser?.profileimage;
    if (reduxImg && !sessionStorage.getItem('customer_profile_image')) {
        setDisplayImage(reduxImg);
    }

    const handleProfileUpdate = () => {
        const sessionImg = sessionStorage.getItem('customer_profile_image');
        if (sessionImg) setDisplayImage(sessionImg);
    };

    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleProfileUpdate);
  }, [currentUser]);

  let profileImageUrl = null;
  if (displayImage) {
    if (displayImage.startsWith('http') || displayImage.startsWith('blob:')) {
      profileImageUrl = displayImage;
    } else {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const cleanPath = displayImage.startsWith('/') ? displayImage : `/${displayImage}`;
      profileImageUrl = `${BASE_URL}${cleanPath}`;
    }
  }

  return (
    <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
              <Scissors className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                GroomNet
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">

            <Link 
              to="/booking-history" 
              className="relative p-2.5 rounded-full bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all duration-300 border border-transparent hover:border-purple-100"
            >
              <Bell className="w-5 h-5" />
              {/* ✅ Animated Badge */}
              <NotificationBadge count={totalUnreadCount} />
            </Link>

            <Link to="/customer-profile" className="flex items-center gap-3 group pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
              <div className="relative">
                {profileImageUrl ? (
                  <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-pink-500">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<div class="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-2 border-white"><User class="w-5 h-5 text-gray-400" /></div>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors border-2 border-white shadow-sm">
                    <User className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;