import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import { useNavigate } from 'react-router-dom';
import AddressCard from '../../components/customercompo/addresscomponents/AddressCard';
import AddressForm from '../../components/customercompo/addresscomponents/AddressForm';
import LocationButton from '../../components/customercompo/addresscomponents/LocationButton';

const AddAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const navigate = useNavigate();

  const [bookingParams, setBookingParams] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBookingParams({
      service_id: params.get('service_id'),
      barber_id: params.get('barber_id'),
      slot_id: params.get('slot_id'),
    });
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/customersite/addresses/');
      setAddresses(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationSuccess(false);
      const location = await getCurrentLocation();
      
      const geocodeResponse = await apiClient.post('/customersite/user-location/', {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      const completeAddress = {
        name: 'Current Location',
        mobile: '0000000000',
        building: geocodeResponse.data.building || 'Current Location',
        street: geocodeResponse.data.street || 'Current Location Street',
        city: geocodeResponse.data.city || 'Current City',
        district: geocodeResponse.data.district || 'Current District',
        state: geocodeResponse.data.state || 'Current State',
        pincode: geocodeResponse.data.pincode || '000000',
        latitude: location.latitude,
        longitude: location.longitude,
        is_default: addresses.length === 0,
      };
      
      const saveResponse = await apiClient.post('/customersite/addresses/', completeAddress);
      setAddresses((prev) => [...prev, saveResponse.data]);
      
      setLocationSuccess(true);
      setTimeout(() => {
        handleAddressSelect(saveResponse.data);
      }, 1500);
      
    } catch (error) {
      console.error('Error getting current location:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    const queryParams = new URLSearchParams({
      ...bookingParams,
      address_id: address.id,
    });
    navigate(`/confirm-booking?${queryParams.toString()}`);
  };

  const handleSaveAddress = async (data, reset) => {
    try {
      setSaving(true);
      const response = await apiClient.post('/customersite/addresses/', data);
      setAddresses((prev) => [...prev, response.data]);
      reset();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-gray-800">Select Address</h1>
        </div>

        <LocationButton
          onClick={handleUseCurrentLocation}
          loading={locationLoading}
          success={locationSuccess}
        />

        {!showForm && (
          <>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white rounded-lg p-3 mb-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Address
            </button>

            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onSelect={handleAddressSelect}
                />
              ))}
            </div>
          </>
        )}

        {showForm && (
          <AddressForm
            onSave={handleSaveAddress}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default AddAddress;
