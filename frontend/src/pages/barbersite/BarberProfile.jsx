import React, { useEffect, useState } from 'react';
import apiClient from '../../slices/api/apiIntercepters';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import ProfileCard from '../../components/profilecompo/ProfileCard';
import ProfileField from '../../components/profilecompo/ProfileField';
import LoadingSpinner from '../../components/profilecompo/LoadingSpinner';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';
import { useBooking } from '../../contexts/BookingContext';
import { useNavigate,useLocation } from 'react-router-dom';

function BarberProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/profile-service/user-profile/');
      if (res.data.usertype === 'barber') {
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
      const previewUrl = URL.createObjectURL(file);
      setProfile(prev => ({
        ...prev,
        profileimage: previewUrl
      }));

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
      <div className="w-64 bg-[#0c1b2c] text-white shadow-2xl">
        <BarberSidebar />
      </div>
      <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Barber Profile</h2>
            <p className="text-gray-600">Manage your professional profile and information</p>
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
                  label="Full Name"
                  value={isEditing ? editedProfile.name : profile.name}
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
                  value={isEditing ? editedProfile.phone : profile.phone}
                  isEditing={isEditing}
                  onChange={handleChange}
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
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
                    label="Professional Bio"
                    value={isEditing ? editedProfile.bio : profile.bio}
                    isEditing={isEditing}
                    onChange={handleChange}
                    name="bio"
                    multiline={true}
                    placeholder="Tell us about your experience and specialties..."
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

export default BarberProfile;