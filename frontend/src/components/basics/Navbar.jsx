
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
  const rawImage = currentUser?.profile_image || currentUser?.profileimage;


  let profileImageUrl = null;
  if (rawImage) {
    if (rawImage.startsWith('http')) {
      profileImageUrl = rawImage;
    } else {
      
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      profileImageUrl = `${BASE_URL}${rawImage}`;
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
            <Link to="/booking-history" className="relative p-4 rounded-2xl bg-white/50 border border-white/30 shadow-lg">
              <Bell className="w-6 h-6 text-gray-700" />
              <NotificationBadge count={totalUnreadCount} />
            </Link>

            <Link to="/customer-profile" className="relative group">
              {profileImageUrl ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75"></div>
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="relative w-14 h-14 rounded-2xl object-cover border-3 border-white shadow-2xl"
                    onError={(e) => {
                      
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('hidden');
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-3 border-white shadow-2xl">
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