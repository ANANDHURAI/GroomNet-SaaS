import { Card } from "./Card";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "../../slices/api/apiIntercepters";

export const TimeSlotSelector = ({ selectedDate, onSlotsSelect, selectedSlots }) => {
  const [existingSlots, setExistingSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchExistingSlotsForDate();
    }
  }, [selectedDate]);

  const fetchExistingSlotsForDate = async () => {
    setLoading(true);
    try {
      setExistingSlots([]);
      const response = await apiClient.get(`/barbersite/barber-slots/?date=${selectedDate}`);
      console.log(`Fetched slots for ${selectedDate}:`, response.data);
      setExistingSlots(response.data || []);
    } catch (error) {
      console.error('Error fetching existing slots:', error);
      setExistingSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 24; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ start: startTime, end: endTime, id: `${hour}` });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isSlotAlreadyBooked = (slot) => {
    return existingSlots.some(existingSlot => {
      const existingStart = existingSlot.start_time.substring(0, 5);
      const existingEnd = existingSlot.end_time.substring(0, 5);
      const slotDate = existingSlot.date;

      return slotDate === selectedDate &&
        existingStart === slot.start &&
        existingEnd === slot.end;
    });
  };

  const isTimeGone = (slot) => {
    if (!selectedDate) return false;

    const today = new Date().toISOString().split("T")[0];
    if (selectedDate !== today) return false;

    const now = new Date();
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const slotStartTime = new Date(selectedDate);
    slotStartTime.setHours(startHour, startMin, 0, 0);

    return now >= slotStartTime;
  };

  const toggleSlot = (slot) => {
    if (isSlotAlreadyBooked(slot) || isTimeGone(slot)) return;

    const slotId = `${slot.start}-${slot.end}`;
    const isSelected = selectedSlots.includes(slotId);

    if (isSelected) {
      onSlotsSelect(selectedSlots.filter(id => id !== slotId));
    } else {
      onSlotsSelect([...selectedSlots, slotId]);
    }
  };

  const formatTime = (time) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    if (hourNum === 0) return '12 AM';
    if (hourNum < 12) return `${hourNum} AM`;
    if (hourNum === 12) return '12 PM';
    return `${hourNum - 12} PM`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading existing slots for {selectedDate}...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Select Time Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {timeSlots.map((slot) => {
          const slotId = `${slot.start}-${slot.end}`;
          const isSelected = selectedSlots.includes(slotId);
          const isAlreadyBooked = isSlotAlreadyBooked(slot);
          const isGone = isTimeGone(slot);

          return (
            <button
              key={slot.id}
              onClick={() => toggleSlot(slot)}
              disabled={isAlreadyBooked || isGone}
              className={`p-3 rounded-lg text-center transition-colors duration-200 border-2 ${
                isAlreadyBooked
                  ? 'bg-red-100 text-red-600 border-red-200 cursor-not-allowed'
                  : isGone
                    ? 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed'
                    : isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-medium">
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </div>
              {isAlreadyBooked && <div className="text-xs mt-1">Already Booked</div>}
              {isGone && !isAlreadyBooked && <div className="text-xs mt-1">Time Passed</div>}
            </button>
          );
        })}
      </div>

      {selectedSlots.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected for {selectedDate}
          </p>
        </div>
      )}

      {existingSlots.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Existing slots for {selectedDate} ({existingSlots.length} slot{existingSlots.length > 1 ? 's' : ''}):
          </p>
          <div className="flex flex-wrap gap-2">
            {existingSlots.map((slot, index) => (
              <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                {formatTime(slot.start_time.substring(0, 5))} - {formatTime(slot.end_time.substring(0, 5))}
                {slot.is_booked && ' (Customer Booked)'}
              </span>
            ))}
          </div>
        </div>
      )}

      {existingSlots.length === 0 && !loading && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            No existing slots for {selectedDate}. You can create new slots!
          </p>
        </div>
      )}
    </Card>
  );
};
