import { useState, useEffect } from 'react'; // ✅ Import hooks
import { Scissors, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBadge from '../../components/notification/NotificationBadge';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useSelector } from "react-redux";

function Navbar() {
  const user = useSelector(state => state.login.user);
  const registerUser = useSelector(state => state.register?.user);
  const currentUser = user || registerUser;

  const { totalUnreadCount } = useNotificationContext();

  // ✅ 1. Initialize state with SessionStorage (Freshest) OR Redux (Fallback)
  const [displayImage, setDisplayImage] = useState(
    sessionStorage.getItem('customer_profile_image') || 
    currentUser?.profile_image || 
    currentUser?.profileimage
  );

  // ✅ 2. Listen for updates from Profile Page
  useEffect(() => {
    // Sync if Redux updates (e.g., fresh login)
    const reduxImg = currentUser?.profile_image || currentUser?.profileimage;
    if (reduxImg && !sessionStorage.getItem('customer_profile_image')) {
        setDisplayImage(reduxImg);
    }

    // Listener for manual updates
    const handleProfileUpdate = () => {
        const sessionImg = sessionStorage.getItem('customer_profile_image');
        if (sessionImg) setDisplayImage(sessionImg);
    };

    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileImageUpdated', handleProfileUpdate);
  }, [currentUser]);

  // ✅ 3. Construct URL logic
  let profileImageUrl = null;
  if (displayImage) {
    if (displayImage.startsWith('http') || displayImage.startsWith('blob:')) {
      profileImageUrl = displayImage;
    } else {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      // Prevent double slash if raw string starts with /
      const cleanPath = displayImage.startsWith('/') ? displayImage : `/${displayImage}`;
      profileImageUrl = `${BASE_URL}${cleanPath}`;
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-2xl border-b border-purple-100/50 sticky top-0 z-50 shadow-2xl shadow-purple-500/10">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center space-x-4">
            <Link to="/home" className="flex items-center space-x-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Scissors className="text-white w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  GroomNet
                </span>
                <span className="text-sm text-gray-500 font-bold tracking-wider">Your Grooming Partner</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/booking-history" className="relative p-4 rounded-2xl bg-white/50 border border-white/30 shadow-lg hover:shadow-xl transition-all">
              <Bell className="w-6 h-6 text-gray-700" />
              <NotificationBadge count={totalUnreadCount} />
            </Link>

            <Link to="/customer-profile" className="relative group">
              {profileImageUrl ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="relative w-14 h-14 rounded-2xl object-cover border-3 border-white shadow-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Fallback to Icon if image fails
                      e.target.parentNode.innerHTML = `
                        <div class="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-3 border-white shadow-2xl">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-purple-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>`;
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-3 border-white shadow-2xl group-hover:shadow-3xl transition-all">
                  <User className="w-7 h-7 text-purple-600" />
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