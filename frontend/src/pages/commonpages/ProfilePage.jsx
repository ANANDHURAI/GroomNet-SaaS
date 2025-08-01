// import React, { useState, useEffect } from 'react';
// import apiClient from '../../slices/api/apiIntercepters';
// import ProfileNavbar from '../../components/profilecompo/ProfileNavbar';
// import CusSideNavBar from '../../components/customercompo/CusSideNavBar';
// import { ProfileDisplay } from '../../components/profilecompo/ProfileDisplay';
// import { ProfileField } from '../../components/profilecompo/ProfileField';
// import { ProfileInput } from '../../components/profilecompo/ProfileInput';
// import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
// import { Camera, User, Phone, Calendar, FileText, Edit3, Save, X, Mail } from 'lucide-react';

// function ProfilePage() {
//   const [data, setData] = useState({});
//   const [originalData, setOriginalData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [isEdit, setIsEdit] = useState(false);
//   const [error, setError] = useState(null);
//   const [uploadedImage, setUploadedImage] = useState(null);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = () => {
//     setLoading(true);
//     apiClient.get('/profile-service/user-profile/')
//       .then(response => {
//         setData(response.data);
//         setOriginalData(response.data);
//         setLoading(false);
//         setError(null);
//       })
//       .catch(error => {
//         console.error('Profile load error:', error);
//         setError('Failed to load profile');
//         setLoading(false);
//       });
//   };

//   const handleSave = async () => {
//     try {
//       if (uploadedImage instanceof File) {
//         const formData = new FormData();
//         if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
//         if (data.gender) formData.append('gender', data.gender);
//         if (data.bio) formData.append('bio', data.bio);
//         formData.append('profileimage', uploadedImage);

//         const response = await apiClient.put('/profile-service/user-profile/', formData);
//         if (data.profileimage && data.profileimage.startsWith('blob:')) {
//           URL.revokeObjectURL(data.profileimage);
//         }

//         setData(response.data);
//         setOriginalData(response.data);
//       } else {
//         const updateData = {};
//         if (data.date_of_birth) updateData.date_of_birth = data.date_of_birth;
//         if (data.gender) updateData.gender = data.gender;
//         if (data.bio) updateData.bio = data.bio;

//         const response = await apiClient.put('/profile-service/user-profile/', updateData, {
//           headers: { 'Content-Type': 'application/json' }
//         });

//         setData(response.data);
//         setOriginalData(response.data);
//       }

//       setUploadedImage(null);
//       setIsEdit(false);
//       setError(null);
//     } catch (error) {
//       console.error('Profile update error:', error);
//       setError(error.response?.data?.error || error.response?.data?.detail || 'Failed to update profile');
//     }
//   };

//   const handleCancel = () => {
//     setIsEdit(false);
//     setUploadedImage(null);
//     setData(originalData);
//     setError(null);
//   };

//   const handleInputChange = (field, value) => {
//     setData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const previewUrl = URL.createObjectURL(file);
//       setUploadedImage(file);
//       setData(prev => ({ ...prev, profileimage: previewUrl }));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   const hasSidebar = data.usertype?.toLowerCase() === 'customer';

//   const ProfileContent = () => (
//     <div className={`${hasSidebar ? 'ml-64' : ''} min-h-screen bg-gray-50`}>
//       <div className="max-w-2xl mx-auto p-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div className="relative">
//                   <img
//                     src={data.profileimage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=6366f1&color=fff&size=80`}
//                     alt="Profile"
//                     className="w-20 h-20 rounded-full border-4 border-white object-cover"
//                     onError={(e) => {
//                       e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=6366f1&color=fff&size=80`;
//                     }}
//                   />
//                   {isEdit && (
//                     <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
//                       <Camera className="w-4 h-4" />
//                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                     </label>
//                   )}
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold">{data.name}</h1>
//                   <p className="text-blue-100 capitalize">{data.usertype}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={isEdit ? handleSave : () => setIsEdit(true)}
//                 className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
//               >
//                 {isEdit ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
//                 <span>{isEdit ? 'Save' : 'Edit'}</span>
//               </button>
//             </div>
//           </div>

//           <div className="p-6 space-y-6">
//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <div className="grid md:grid-cols-2 gap-6">
//               <ProfileField label="Email" icon={Mail}>
//                 <ProfileDisplay value={data.email} icon={Mail} />
//               </ProfileField>

//               <ProfileField label="Phone" icon={Phone}>
//                 <ProfileDisplay value={data.phone} icon={Phone} />
//               </ProfileField>

//               <ProfileField label="Date of Birth" icon={Calendar}>
//                 {isEdit ? (
//                   <ProfileInput
//                     type="date"
//                     value={data.date_of_birth}
//                     onChange={(value) => handleInputChange('date_of_birth', value)}
//                   />
//                 ) : (
//                   <ProfileDisplay value={data.date_of_birth} icon={Calendar} />
//                 )}
//               </ProfileField>

//               <ProfileField label="Gender" icon={User}>
//                 {isEdit ? (
//                   <ProfileInput
//                     type="select"
//                     value={data.gender}
//                     onChange={(value) => handleInputChange('gender', value)}
//                     options={[
//                       { value: 'male', label: 'Male' },
//                       { value: 'female', label: 'Female' },
//                       { value: 'other', label: 'Other' }
//                     ]}
//                   />
//                 ) : (
//                   <ProfileDisplay value={data.gender} icon={User} />
//                 )}
//               </ProfileField>
//             </div>

//             <ProfileField label="Bio" icon={FileText}>
//               {isEdit ? (
//                 <ProfileInput
//                   type="textarea"
//                   value={data.bio}
//                   onChange={(value) => handleInputChange('bio', value)}
//                   placeholder="Tell us about yourself..."
//                   rows={4}
//                 />
//               ) : (
//                 <ProfileDisplay value={data.bio} icon={FileText} />
//               )}
//             </ProfileField>

//             {isEdit && (
//               <div className="flex justify-end space-x-3 pt-4">
//                 <button
//                   onClick={handleCancel}
//                   className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
//                 >
//                   <X className="w-4 h-4" />
//                   <span>Cancel</span>
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//                 >
//                   <Save className="w-4 h-4" />
//                   <span>Save Changes</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex flex-col">
//       <ProfileNavbar userType={data.usertype} />

//       <div className="flex">
//         {hasSidebar && <CusSideNavBar />}
//         <ProfileContent />
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;
