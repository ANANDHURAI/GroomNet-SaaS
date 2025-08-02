import { DateSelector } from "../../components/mini ui/DateSelector";
import { TimeSlotSelector } from "../../components/mini ui/TimeSlotSelector";
import { Card } from "../../components/mini ui/Card";
import { Button } from "../../components/mini ui/Button";
import { MySlots } from "../../components/mini ui/MySlots";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";
import { useEffect, useState } from "react";
import apiClient from "../../slices/api/apiIntercepters";
import { ChevronLeft, Check, Calendar } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalBookingNotifier from "../../components/notification/GlobalBookingNotifier";
import { useBooking } from "../../contexts/BookingContext";

export const BarberSlotBooking = () => {
  const [currentStep, setCurrentStep] = useState('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentBooking, notification, setNotification } = useBooking();
  
  const isOnWorkingAreaPage = location.pathname.includes('/instant-booking');

  useEffect(() => {
    fetchMySlots();
  }, []);

  const fetchMySlots = async () => {
    try {
      const response = await apiClient.get('/barbersite/barber-slots/');
      setMySlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setCurrentStep('slots');
  };

  const handleConfirmSlots = async () => {
    if (selectedSlots.length === 0) return;
    
    setLoading(true);
    try {
      const promises = selectedSlots.map(slotTime => {
        const [startTime, endTime] = slotTime.split('-');
        const slotData = {
          date: selectedDate,
          start_time: startTime + ':00', 
          end_time: endTime + ':00'    
        };
        console.log('Creating slot with data:', slotData); 
        return apiClient.post('/barbersite/barber-slots/create-slot/', slotData);
      });
      
      const results = await Promise.all(promises);
      console.log('Slot creation results:', results);
      
      setCurrentStep('success');
      await fetchMySlots();
      
      setSelectedSlots([]);
    } catch (error) {
      console.error('Error creating slots:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('date');
    setSelectedDate('');
    setSelectedSlots([]);
  };

  const handleCancelSlot = (slotId) => {
    setMySlots(mySlots.filter(slot => slot.id !== slotId));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      <BarberSidebar />
      
      <div className="flex-1 ml-64"> 
        <GlobalBookingNotifier
        currentBooking={currentBooking}
        notification={notification}
        setNotification={setNotification}
        navigate={navigate}
        location={location}
        isOnWorkingAreaPage={isOnWorkingAreaPage}
      />
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Availability</h1>
            <p className="text-gray-600">Set your working hours and manage your slots</p>
          </div>

          {currentStep === 'date' && (
            <DateSelector 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          )}

          {currentStep === 'slots' && (
            <div className="space-y-6">
              <TimeSlotSelector
                selectedDate={selectedDate}
                onSlotsSelect={setSelectedSlots}
                selectedSlots={selectedSlots}
              />
              
              <div className="flex justify-between items-center">
                <Button variant="secondary" onClick={() => setCurrentStep('date')}>
                  <ChevronLeft className="w-4 h-4" />
                  Back to Date
                </Button>
                
                <Button 
                  variant="success"
                  onClick={handleConfirmSlots}
                  disabled={selectedSlots.length === 0 || loading}
                >
                  <Check className="w-4 h-4" />
                  {loading ? 'Confirming...' : `Confirm ${selectedSlots.length} Slot${selectedSlots.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Slots Booked!</h2>
              <p className="text-gray-600 mb-6">Your availability has been successfully updated</p>
              <Button onClick={handleReset}>
                <Calendar className="w-4 h-4" />
                Book More Slots
              </Button>
            </Card>
          )}

          <MySlots 
            slots={mySlots}
            onCancelSlot={handleCancelSlot}
            onRefetch={fetchMySlots}
          />
        </div>
      </div>
    </div>
  );
};

export default BarberSlotBooking;