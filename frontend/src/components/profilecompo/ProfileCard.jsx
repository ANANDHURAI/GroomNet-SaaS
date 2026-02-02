import React from 'react';
import { User, Camera, Edit2, Save, X } from 'lucide-react';

const ProfileCard = ({ profile, isEditing, onEdit, onSave, onCancel, onImageUpload, children, loading }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">
      
      <div className="relative h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 justify-between">
          
          <div className="flex items-end">
          
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                {profile?.profileimage ? (
                  <img
                    src={profile.profileimage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={48} />
                  </div>
                )}
              </div>

             
              {isEditing && (
                <>
                  <label 
                    htmlFor="profile-upload"
                    className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                  >
                    <Camera size={18} />
                  </label>
                  <input 
                    id="profile-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={onImageUpload} 
                    className="hidden" 
                  />
                </>
              )}
            </div>

            <div className="ml-6 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name || 'User'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {profile?.usertype || 'Member'}
                </span>
                <span className="text-gray-500 text-sm">{profile?.email}</span>
              </div>
            </div>
          </div>

          
          <div className="mt-4 md:mt-0 flex gap-3">
            {!isEditing ? (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
              >
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                  disabled={loading}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={onSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full mb-8"></div>

        <div className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;