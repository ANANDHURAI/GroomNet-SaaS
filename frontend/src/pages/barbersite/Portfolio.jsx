import React, { useEffect, useState } from 'react';
import BarberSidebar from '../../components/barbercompo/BarberSidebar';
import apiClient from '../../slices/api/apiIntercepters';
import { ProfileDisplay } from '../../components/profilecompo/ProfileDisplay';
import ProfileField from '../../components/profilecompo/ProfileField';
import { ProfileInput } from '../../components/profilecompo/ProfileInput';
import { User, MapPin, Calendar, Globe, Edit2, Save, X, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import GlobalBookingNotifier from '../../components/notification/GlobalBookingNotifier';

function Portfolio() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isNewBarber, setIsNewBarber] = useState(false); 

    const [formData, setFormData] = useState({
        expert_at: '',
        current_location: '',
        experience_years: '',
        travel_radius_km: '',
        is_available: true
    });

    const navigate = useNavigate();

    const location = useLocation();
    const { currentBooking, notification, setNotification } = useBooking();
    
    const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/barbersite/barber-portfolio/');
            setData(response.data);
            setFormData({
                expert_at: response.data.expert_at || '',
                current_location: response.data.current_location || '',
                experience_years: response.data.experience_years || '',
                travel_radius_km: response.data.travel_radius_km || '',
                is_available: response.data.is_available !== undefined ? response.data.is_available : true
            });
        } catch (error) {
            if (error.response?.status === 404) {
                setIsEditing(true);
                setIsNewBarber(true); // NEW
            } else {
                setError('Failed to load portfolio. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.expert_at.trim() || !formData.current_location.trim()) {
            setError('Expertise and Location are required');
            return;
        }

        try {
            const response = await apiClient.put('/barbersite/barber-portfolio/', formData);
            setData(response.data);
            setIsEditing(false);
            setIsNewBarber(false); // Hide message after save
            setError('');
            setSuccess('Portfolio saved successfully!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Failed to save portfolio. Please try again.';
            setError(errorMsg);
            setSuccess('');
        }
    };

    const handleCancel = () => {
        if (data) {
            setFormData({
                expert_at: data.expert_at || '',
                current_location: data.current_location || '',
                experience_years: data.experience_years || '',
                travel_radius_km: data.travel_radius_km || '',
                is_available: data.is_available !== undefined ? data.is_available : true
            });
        }
        setIsEditing(false);
        setError('');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <BarberSidebar />
                <div className="flex-1 p-6 flex justify-center items-center text-gray-500">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <BarberSidebar />
            <GlobalBookingNotifier
                currentBooking={currentBooking}
                notification={notification}
                setNotification={setNotification}
                navigate={navigate}
                location={location}
                isOnWorkingAreaPage={isOnWorkingAreaPage}
            />
            <div className="flex-1 p-6 ml-64">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
                                <p className="text-gray-600 mt-1">
                                    {data ? 'Manage your professional information' : 'Create your professional portfolio'}
                                </p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    {data ? 'Edit' : 'Create'} Portfolio
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </button>
                                    {data && (
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {isNewBarber && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4" role="alert">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-yellow-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                                </svg>
                                <p className="text-sm font-medium">
                                    Welcome! It looks like you haven’t set up your portfolio yet. Please update your portfolio to get started and be visible to customers.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
                    {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileField label="Expertise" icon={User}>
                                {isEditing ? (
                                    <ProfileInput
                                        value={formData.expert_at}
                                        onChange={(val) => handleInputChange('expert_at', val)}
                                        placeholder="e.g., Hair Cutting"
                                    />
                                ) : (
                                    <ProfileDisplay value={data?.expert_at} icon={User} />
                                )}
                            </ProfileField>
                            <ProfileField label="Current Location" icon={MapPin}>
                                {isEditing ? (
                                    <ProfileInput
                                        value={formData.current_location}
                                        onChange={(val) => handleInputChange('current_location', val)}
                                        placeholder="e.g., Downtown"
                                    />
                                ) : (
                                    <ProfileDisplay value={data?.current_location} icon={MapPin} />
                                )}
                            </ProfileField>
                            <ProfileField label="Years of Experience" icon={Calendar}>
                                {isEditing ? (
                                    <ProfileInput
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={(val) => handleInputChange('experience_years', val)}
                                        placeholder="e.g., 3"
                                    />
                                ) : (
                                    <ProfileDisplay value={`${data?.experience_years || '0'} years`} icon={Calendar} />
                                )}
                            </ProfileField>
                            <ProfileField label="Travel Radius (km)" icon={Globe}>
                                {isEditing ? (
                                    <ProfileInput
                                        type="number"
                                        value={formData.travel_radius_km}
                                        onChange={(val) => handleInputChange('travel_radius_km', val)}
                                        placeholder="e.g., 10"
                                    />
                                ) : (
                                    <ProfileDisplay value={`${data?.travel_radius_km || '0'} km`} icon={Globe} />
                                )}
                            </ProfileField>
                            <div className="md:col-span-2">
                                <ProfileField label="Availability Status">
                                    {isEditing ? (
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_available}
                                                onChange={(e) =>
                                                    handleInputChange('is_available', e.target.checked)
                                                }
                                            />
                                            <span className="text-gray-700">Available for bookings</span>
                                        </label>
                                    ) : (
                                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                            data?.is_available
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {data?.is_available ? 'Available' : 'Unavailable'}
                                        </div>
                                    )}
                                </ProfileField>
                            </div>
                        </div>

                        {data && (
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => {
                                        const barberId = sessionStorage.getItem('barber_id');
                                        if (barberId) {
                                            navigate('/barber/ratings/');
                                        } else {
                                            console.error('No barber_id found in session storage');
                                            alert('Session expired. Please login again.');
                                        }
                                    }}
                                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    <Star className="w-4 h-4 mr-2" />
                                    View Ratings
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
