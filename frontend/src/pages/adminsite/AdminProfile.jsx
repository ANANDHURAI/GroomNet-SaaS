import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import AdminSidebar from '../../components/admincompo/AdminSidebar';
import { Shield, Users, Settings } from 'lucide-react';
import ProfileField from '../../components/profilecompo/ProfileField';
import ProfileCard from '../../components/profilecompo/ProfileCard';
import LoadingSpinner from '../../components/profilecompo/LoadingSpinner';


function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/profile-service/user-profile/');
      if (res.data.usertype === 'admin') {
        setProfile(res.data);
        setEditedProfile(res.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Add profile fields
      Object.keys(editedProfile).forEach(key => {
        if (key !== 'profileImageFile' && key !== 'profileimage' && editedProfile[key] !== null && editedProfile[key] !== undefined) {
          formData.append(key, editedProfile[key]);
        }
      });
      
      // Add image file if selected
      if (editedProfile.profileImageFile) {
        formData.append('profileimage', editedProfile.profileImageFile);
      }
      
      const res = await apiClient.put('/profile-service/user-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(res.data);
      setIsEditing(false);
      // Clean up the temporary file reference
      setEditedProfile(prev => {
        const { profileImageFile, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      
      // Update the profile state with preview
      setProfile(prev => ({
        ...prev,
        profileimage: previewUrl
      }));
      
      // Store the file for actual upload when saving
      setEditedProfile(prev => ({
        ...prev,
        profileImageFile: file,
        profileimage: previewUrl
      }));
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-2xl">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-800">Admin Profile</h2>
            </div>
            <p className="text-gray-600">System administrator profile and settings</p>
          </div>

          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Access</p>
                  <p className="text-2xl font-bold text-gray-900">Full Admin</p>
                </div>
                <Shield className="w-10 h-10 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Management</p>
                  <p className="text-2xl font-bold text-gray-900">Enabled</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Config</p>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                </div>
                <Settings className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl">
              <LoadingSpinner />
            </div>
          ) : profile ? (
            <ProfileCard
              profile={profile}
              isEditing={isEditing}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onImageUpload={handleImageUpload}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Administrator Name"
                  value={isEditing ? editedProfile.name : profile.name}
                  isEditing={isEditing}
                  onChange={handleChange}
                  name="name"
                  placeholder="Enter administrator name"
                />

                <ProfileField
                  label="Email Address"
                  value={profile.email}
                  isEditing={false}
                />

                <ProfileField
                  label="Phone Number"
                  value={isEditing ? editedProfile.phone : profile.phone}
                  isEditing={isEditing}
                  onChange={handleChange}
                  name="phone"
                  type="tel"
                  placeholder="Enter contact number"
                />

                <ProfileField
                  label="Gender"
                  value={isEditing ? editedProfile.gender : profile.gender}
                  isEditing={isEditing}
                  onChange={handleChange}
                  name="gender"
                  options={genderOptions}
                />

                <ProfileField
                  label="Date of Birth"
                  value={isEditing ? editedProfile.date_of_birth : profile.date_of_birth}
                  isEditing={isEditing}
                  onChange={handleChange}
                  name="date_of_birth"
                  type="date"
                />

                <div className="md:col-span-2">
                  <ProfileField
                    label="Administrator Notes"
                    value={isEditing ? editedProfile.bio : profile.bio}
                    isEditing={isEditing}
                    onChange={handleChange}
                    name="bio"
                    multiline={true}
                    placeholder="Administrative notes and responsibilities..."
                  />
                </div>
              </div>
            </ProfileCard>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-600">No profile data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;