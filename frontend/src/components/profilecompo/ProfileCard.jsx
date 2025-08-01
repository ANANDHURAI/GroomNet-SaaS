// components/shared/ProfileCard.jsx
import React from 'react';
import { User, Camera, Edit3 } from 'lucide-react';

const ProfileCard = ({ profile, isEditing, onEdit, onSave, onCancel, onImageUpload, children }) => {
  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {profile?.profileimage ? (
                  <img
                    src={profile.profileimage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Only show camera button in edit mode */}
              {isEditing && (
                <>
                  <button 
                    onClick={() => document.getElementById('profile-image-upload').click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="text-white">
              <h1 className="text-2xl font-bold">{profile?.name || 'Loading...'}</h1>
              <p className="text-blue-100 text-sm">{profile?.email}</p>
              <div className="flex items-center mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                  {profile?.usertype?.charAt(0).toUpperCase() + profile?.usertype?.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
};

export default ProfileCard;