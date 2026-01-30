import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import BarberSidebar from "../../components/barbercompo/BarberSidebar";
import {
  User, CheckCircle, Play, ArrowRight, MapPin, Phone, Scissors, Coins, Clock
} from "lucide-react";

function ServiceCompletePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState(0); 

  const [serviceStarted, setServiceStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  
 
  const [waitingForStartResponse, setWaitingForStartResponse] = useState(false);
  const [waitingForCompleteResponse, setWaitingForCompleteResponse] = useState(false);
  const [waitTimer, setWaitTimer] = useState(0); 
  const [startDenied, setStartDenied] = useState(false);
  const [completeDenied, setCompleteDenied] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
    
    const handleCustomerResponse = (event) => {
      const msg = event.detail;
      if (msg.subtype === "start_response") {
        setWaitingForStartResponse(false);
        if (msg.response === "ready") {
          handleForceStart(); 
        } else if (msg.response === "wait") {
          setStartDenied(true);
          startTimer(120);
          setNotification("Customer requested 2 mins wait.");
        }
      }
      if (msg.subtype === "complete_response") {
        setWaitingForCompleteResponse(false);
        if (msg.response === "yes") {
          handleFinalComplete(); 
        } else if (msg.response === "no") {
          setCompleteDenied(true);
          startTimer(60); 
          setNotification("Customer said not finished. Please wait.");
        }
      }
    };

    window.addEventListener("service_response", handleCustomerResponse);
    return () => window.removeEventListener("service_response", handleCustomerResponse);
  }, [bookingId]);

  const startTimer = (seconds) => {
    setWaitTimer(seconds);
    const interval = setInterval(() => {
      setWaitTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStartDenied(false); 
          setCompleteDenied(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchServiceDetails = () => {
    apiClient.get(`/instant-booking/complete/service/${bookingId}/`)
      .then((response) => {
        setData(response.data);
        if (response.data.service_started_at) setServiceStarted(true);
        if (response.data.status === "COMPLETED") setIsCompleted(true);
        if (response.data.payment_method === "COD" && response.data.payment_done) setIsCollected(true);
       
        if(response.data.status === "COMPLETED"){
             const e = parseFloat(response.data.price) - parseFloat(response.data.platform_fee);
             setEarnings(e.toFixed(2));
        }
      });
  };

  const handleRequestStart = () => {
    setLoading(true);
    setWaitingForStartResponse(true);
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'request_start' })
      .catch(() => setWaitingForStartResponse(false))
      .finally(() => setLoading(false));
  };

  const handleForceStart = () => {
    setLoading(true);
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'force_start' })
      .then(() => {
        setServiceStarted(true);
        setNotification("Service Started!");
        setStartDenied(false);
      })
      .finally(() => setLoading(false));
  };

  const handleRequestComplete = () => {
    setLoading(true);
    setWaitingForCompleteResponse(true);
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'request_complete' })
      .catch(() => setWaitingForCompleteResponse(false))
      .finally(() => setLoading(false));
  };

  const handleFinalComplete = () => {
    setLoading(true);
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'complete_service' })
      .then((res) => {
        setIsCompleted(true);
        setEarnings(res.data.earnings || 0); 
        setNotification("Service Completed!");
      })
      .finally(() => setLoading(false));
  };

  const handleCollectAmount = () => {
    setLoading(true);
    apiClient.post(`/instant-booking/complete/service/${bookingId}/`, { action: 'collect_cod' })
      .then(() => setIsCollected(true))
      .finally(() => setLoading(false));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-72 fixed h-full bg-white shadow-md z-10"><BarberSidebar /></div>
      <div className="flex-1 ml-72 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
         
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                <h1 className="text-xl font-bold">Booking #{data.id}</h1>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">{data.payment_method}</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><User size={20} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-semibold text-gray-800">{data.customer_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><Scissors size={20} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-semibold text-gray-800">{data.service}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Coins size={20} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="font-semibold text-gray-800">₹{data.price}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><MapPin size={20} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold text-gray-800 truncate max-w-xs">{data.address}</p>
                    </div>
                </div>
            </div>
          </div>

          {!serviceStarted && !isCompleted && (
            <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl text-center">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Ready to Start?</h2>
              
              {startDenied && (
                 <div className="mb-4">
                    <p className="text-red-600 font-semibold mb-2">Customer requested wait.</p>
                    <div className="text-3xl font-bold text-red-500">{formatTime(waitTimer)}</div>
                 </div>
              )}
              {waitingForStartResponse && <div className="animate-pulse text-blue-600 font-semibold mb-4">Waiting for customer...</div>}

              <button 
                onClick={startDenied || waitTimer > 0 ? null : (waitTimer === 0 && !startDenied && !waitingForStartResponse ? handleRequestStart : handleForceStart)}
                disabled={loading || (startDenied && waitTimer > 0) || waitingForStartResponse}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all
                  ${startDenied && waitTimer > 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}
                `}
              >
                {waitTimer > 0 ? "Please Wait..." : (waitTimer === 0 && !startDenied && !waitingForStartResponse) ? "Request Start Service" : "Force Start Service"}
              </button>
            </div>
          )}

          {serviceStarted && !isCompleted && (
            <div className="space-y-6">
               <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-4">
                 <Play className="text-green-600 w-8 h-8 animate-pulse" />
                 <div><h3 className="font-bold text-green-800">Service in Progress</h3></div>
               </div>

               {data.payment_method === 'COD' && !isCollected && (
                 <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-orange-800">Collect Cash</h3>
                        <p className="text-orange-600">Please collect ₹{data.price} from customer</p>
                    </div>
                    <button onClick={handleCollectAmount} disabled={loading} className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold">Mark Collected</button>
                 </div>
               )}

               <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Finished the Job?</h3>
                  
                  {completeDenied && (
                    <div className="mb-4">
                        <p className="text-red-600 font-semibold mb-2">Customer said "Not Yet".</p>
                        <div className="text-3xl font-bold text-red-500">{formatTime(waitTimer)}</div>
                    </div>
                  )}
                  {waitingForCompleteResponse && <div className="animate-pulse text-blue-600 font-semibold mb-4">Asking customer verification...</div>}

                  <button 
                    onClick={completeDenied || waitTimer > 0 ? null : (waitTimer === 0 && !completeDenied && !waitingForCompleteResponse ? handleRequestComplete : handleFinalComplete)}
                    disabled={loading || (completeDenied && waitTimer > 0) || waitingForCompleteResponse || (data.payment_method === 'COD' && !isCollected)}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all
                      ${(completeDenied && waitTimer > 0) ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 shadow-lg'}
                    `}
                  >
                    {waitTimer > 0 ? "Please Wait..." : (waitTimer === 0 && !completeDenied && !waitingForCompleteResponse) ? "Verify & Complete" : "Force Complete"}
                  </button>
               </div>
            </div>
          )}

          {isCompleted && (
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-2xl text-white shadow-2xl animate-fade-in-up">
                <div className="flex items-center gap-4 mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                    <div>
                        <h2 className="text-3xl font-bold">Job Completed!</h2>
                        <p className="text-emerald-100">The service has been marked as successful.</p>
                    </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-md border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-emerald-100">Service Price</span>
                        <span className="font-semibold">₹{data.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/20">
                        <span className="text-emerald-100">Platform Fee</span>
                        <span className="font-semibold text-red-200">- ₹{data.platform_fee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Net Earnings</span>
                        <span className="text-2xl font-bold text-yellow-300">₹{earnings}</span>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/barber-earnings')} className="text-white underline font-semibold flex items-center justify-center gap-2 hover:text-emerald-100">
                        Go to Wallet <ArrowRight size={16} />
                    </button>
                </div>
             </div>
          )}
        </div>
      </div>
      {notification && <div className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50">{notification}</div>}
    </div>
  );
}

export default ServiceCompletePage;