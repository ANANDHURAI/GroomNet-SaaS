import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import LoadingSpinner from '../../components/profilecompo/LoadingSpinner';
import ProfileCard from '../../components/profilecompo/ProfileCard';
import ProfileField from '../../components/profilecompo/ProfileField';
import CustomerLayout from '../../components/customercompo/CustomerLayout';
import { toast } from 'react-hot-toast';

function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/profile-service/user-profile/');
      if (res.data.usertype === 'customer') {
        setProfile(res.data);
        setEditedProfile(res.data);
        if (res.data.profileimage) {
          sessionStorage.setItem('customer_profile_image', res.data.profileimage);
        }
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
    setSelectedImageFile(null); 
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const formData = new FormData();
  
      Object.keys(editedProfile).forEach(key => {
        
        if (key !== 'profileimage' && editedProfile[key] !== null && editedProfile[key] !== undefined) {
          formData.append(key, editedProfile[key]);
        }
      });

     
      if (selectedImageFile) {
        formData.append('profileimage', selectedImageFile);
      }
      
      const res = await apiClient.put('/profile-service/user-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(res.data);
     
      if(res.data.profileimage) {
          sessionStorage.setItem('customer_profile_image', res.data.profileimage);
          window.dispatchEvent(new Event('profileImageUpdated'));
      }

      setIsEditing(false);
      setSelectedImageFile(null);
      toast.success("Profile updated successfully!");

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
    setSelectedImageFile(null);
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
     
      setSelectedImageFile(file);

      const previewUrl = URL.createObjectURL(file);
      setEditedProfile(prev => ({
        ...prev,
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
    <CustomerLayout>
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h2>
                  <p className="text-gray-500 mt-2 text-lg">Manage your personal information and account settings</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <LoadingSpinner />
                  </div>
                ) : profile ? (
                  <ProfileCard
                    profile={isEditing ? editedProfile : profile} 
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onImageUpload={handleImageUpload}
                    loading={saveLoading}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ProfileField
                        label="Full Name"
                        value={editedProfile.name}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="name"
                        placeholder="Enter your full name"
                      />

                      <ProfileField
                        label="Email Address"
                        value={profile.email} 
                        isEditing={false}
                      />

                      <ProfileField
                        label="Phone Number"
                        value={editedProfile.phone}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="phone"
                        type="tel"
                        placeholder="+91 00000 00000"
                      />

                      <ProfileField
                        label="Gender"
                        value={editedProfile.gender}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="gender"
                        options={genderOptions}
                      />

                      <ProfileField
                        label="Date of Birth"
                        value={editedProfile.date_of_birth}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="date_of_birth"
                        type="date"
                      />

                      <div className="md:col-span-2">
                        <ProfileField
                          label="About Me"
                          value={editedProfile.bio}
                          isEditing={isEditing}
                          onChange={handleChange}
                          name="bio"
                          multiline={true}
                          placeholder="Tell us a bit about yourself..."
                        />
                      </div>
                    </div>
                  </ProfileCard>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <p className="text-gray-500 text-lg">Failed to load profile data.</p>
                  </div>
                )}
            </div>
        </div>
    </CustomerLayout>
  );
}

export default CustomerProfile;