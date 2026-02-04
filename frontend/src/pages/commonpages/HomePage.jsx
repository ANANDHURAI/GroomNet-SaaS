import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../slices/api/apiIntercepters';
import Navbar from '../../components/basics/Navbar';
import Carousel from '../../components/basics/Carousel';
import CCard from '../../components/basics/CCard';
import SCard from '../../components/basics/SCard';
import LoadingSpinner from '../../components/admincompo/LoadingSpinner';
import { ErrorMessage } from '../../components/admincompo/categoryCom/ErrorMessage';
import ShowType from '../../components/customercompo/ShowType';
import LocationModal from '../../components/basics/LocationModal';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import { ChevronLeft, ChevronRight } from 'lucide-react';


import groom1 from '../../assets/groom 1.jpg';
import groom2 from '../../assets/groom 2.webp';
import groom3 from '../../assets/groom 3.webp';
import groom4 from '../../assets/groom 4.jpg';
import groom5 from '../../assets/groom 5.jpg';
import groom6 from '../../assets/groom 6.jpg';
import AAK from '../../assets/AAK.png';
import Footer from '../../components/basics/Footer';


const heroImages = [
  { src: groom1, title: "Premium Grooming", subtitle: "Experience the best in class service" },
  { src: groom2, title: "Modern Styles", subtitle: "Trending cuts tailored for you" },
  { src: groom3, title: "Expert Barbers", subtitle: "Professionals you can trust" },
  { src: groom4, title: "Luxury Experience", subtitle: "Relax and rejuvenate" },
  { src: groom5, title: "Timeless Looks", subtitle: "Classic styles for the modern man" },
  { src: groom6, title: "Your Style, Your Way", subtitle: "Personalized grooming solutions" },
  { src: AAK, title: "Signature Look", subtitle: " The name is Anbuganapathi Anandhurai" },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-b-[3rem] shadow-2xl mb-12 group">
      {heroImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img
            src={img.src}
            alt={img.title}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[10s] ease-linear"
            style={{ transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-20 text-white transform transition-all duration-700 translate-y-0 opacity-100">
            <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg tracking-tight">
              {img.title}
            </h2>
            <p className="text-xl md:text-2xl font-light opacity-90 drop-shadow-md max-w-2xl">
              {img.subtitle}
            </p>
          </div>
        </div>
      ))}

      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-6 right-8 z-30 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState(null);
  
  const user = useSelector(state => state.login.user);
  const registerUser = useSelector(state => state.register?.user);
  const currentUser = user || registerUser;

  useEffect(() => {
    if (!sessionStorage.getItem('locationSent')) {
      const timer = setTimeout(() => setShowLocationModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableLocation = async () => {
    try {
      const locationData = await getCurrentLocation();
      const response = await apiClient.post('/customersite/user-location/', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy
      });
      
      setLocation(locationData);
      setLocationError('');
      sessionStorage.setItem('locationSent', 'true');
      setShowLocationModal(false);
    } catch (err) {
      setLocationError(typeof err === 'string' ? err : 'Failed to get location');
    }
  };

  const handleDismissLocation = () => {
    setShowLocationModal(false);
    sessionStorage.setItem('locationSent', 'dismissed');
  };

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/customersite/home/');
      setData(response.data);
    } catch (err) {
      setError('Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  return (

    <div className="min-h-screen bg-slate-50 font-sans pt-20">
      <Navbar />
      
      <HeroSection />

      <LocationModal 
        isOpen={showLocationModal}
        onEnableLocation={handleEnableLocation}
        onDismiss={handleDismissLocation}
      />

      {locationError && (
        <div className="container mx-auto px-4 mt-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="font-bold text-amber-800">Location Access Required</p>
              <p className="text-sm text-amber-700">{locationError}</p>
            </div>
            <button
              onClick={handleEnableLocation}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-16 relative z-10 -mt-16">
      
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 mb-12 border border-white/50 mx-4 md:mx-auto max-w-5xl transform hover:-translate-y-1 transition-transform duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{currentUser?.name || 'Guest'}</span>
              </h1>
              {data?.greeting_message && (
                <p className="text-gray-600 text-lg">{data.greeting_message}</p>
              )}
              
              {location && (
                <div className="flex items-center justify-center md:justify-start mt-3 text-green-600 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Location active • Showing nearby services
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-purple-600 shadow-inner">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ShowType />

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="large" text="Curating your experience..." />
          </div>
        )}

        {error && (
          <div className="mb-8">
            <ErrorMessage error={error} onRetry={fetchHomeData} />
          </div>
        )}

        {data?.categories?.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
              
            </div>
            <Carousel>
              {data.categories.map((cat) => (
                <CCard key={cat.id} category={cat} />
              ))}
            </Carousel>
          </div>
        )}

        {data?.services?.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-gray-800">Trending Services</h2>
              
            </div>
            <Carousel>
              {data.services.map((srv) => (
                <SCard key={srv.id} service={srv} />
              ))}
            </Carousel>
          </div>
        )}

        {data && !data.categories?.length && !data.services?.length && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
            <p className="text-gray-500">We are adding new services for you.</p>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default HomePage;