import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';

export const SelectTime = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [params, setParams] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsObj = {
      service_id: urlParams.get('service_id'),
      service_name: urlParams.get('service_name'),
      barber_id: urlParams.get('barber_id'),
      barber_name: urlParams.get('barber_name'),
      selected_date: urlParams.get('selected_date')
    };
    setParams(paramsObj);
    
    if (paramsObj.barber_id && paramsObj.selected_date) {
      fetchTimeSlots(paramsObj.barber_id, paramsObj.selected_date);
    }
  }, []);

  const fetchTimeSlots = async (barberId, date, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const timestamp = new Date().getTime();
      const response = await apiClient.get(
        `/customersite/available-slots/?barber_id=${barberId}&date=${date}&t=${timestamp}`
      );
      
      const slots = response.data || [];
      const filteredSlots = filterPastSlots(slots, date);
      setTimeSlots(filteredSlots);

      if (selectedSlot && !filteredSlots.find(slot => slot.id === selectedSlot.id)) {
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPastSlots = (slots, selectedDate) => {
    const today = new Date();
    const selectedDay = new Date(selectedDate);
    if (selectedDay.toDateString() !== today.toDateString()) {
      return slots;
    }
  
    const currentTime = new Date();
    const bufferTime = new Date(currentTime.getTime() + 30 * 60000);
    
    return slots.filter(slot => {
      const [hours, minutes] = slot.start_time.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      
      return slotTime > bufferTime;
    });
  };

  const formatTime = (timeString) => {
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isSlotSoon = (slotTime) => {
    const today = new Date();
    const selectedDay = new Date(params.selected_date);
    
    if (selectedDay.toDateString() !== today.toDateString()) {
      return false;
    }
    
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotDateTime = new Date();
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = slotDateTime - currentTime;
    return timeDiff <= 60 * 60000;
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleRefresh = () => {
    if (params.barber_id && params.selected_date) {
      fetchTimeSlots(params.barber_id, params.selected_date, true);
    }
  };

  const handleNext = () => {
    if (selectedSlot) {
      const queryParams = new URLSearchParams({
        ...params,
        slot_id: selectedSlot.id,
        slot_time: `${selectedSlot.start_time} - ${selectedSlot.end_time}`
      });
      window.location.href = `/add-address?${queryParams.toString()}`;
    }
  };

  const handleBack = () => {
    window.history.back();
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
      <Navbar/>
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="text-center mb-8">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Time</h2>
          <p className="text-gray-600">Choose your preferred time for</p>
          <p className="text-blue-600 font-medium">{formatDate(params.selected_date)}</p>
          {params.selected_date === new Date().toISOString().split('T')[0] && (
            <p className="text-sm text-gray-500 mt-1">
              Current time: {currentTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {timeSlots.map((slot) => {
            const isSoon = isSlotSoon(slot.start_time);
            return (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot)}
                className={`p-3 rounded-lg border-2 text-sm transition-all relative ${
                  selectedSlot?.id === slot.id
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                } ${isSoon ? 'ring-2 ring-orange-200' : ''}`}
              >
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                {isSoon && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {timeSlots.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-gray-600">No time slots available for this date</p>
              {params.selected_date === new Date().toISOString().split('T')[0] && (
                <p className="text-sm text-gray-500">
                  All slots for today may have passed or are too close to current time
                </p>
              )}
            </div>
          </div>
        )}

        {selectedSlot && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
              </p>
              {isSlotSoon(selectedSlot.start_time) && (
                <p className="text-xs text-orange-600 mt-1">
                   This slot is coming up soon. Please be ready!
                </p>
              )}
            </div>
            
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectTime;