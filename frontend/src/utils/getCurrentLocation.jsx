export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const success = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log('Location obtained:', { latitude, longitude, accuracy });
      resolve({ latitude, longitude, accuracy });
    };

    const error = (err) => {
      console.error('Location error:', err);
      let errorMessage = 'Unable to get location';
      
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while getting location.';
      }
      
      reject(errorMessage);
    };

    if (!navigator.geolocation) {
      reject('Geolocation is not supported by this browser.');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' })
      .then((result) => {
        console.log('Geolocation permission:', result.state);
        
        if (result.state === 'denied') {
          reject('Location access denied. Please enable location permissions in your browser settings.');
        } else {
          navigator.geolocation.getCurrentPosition(success, error, options);
        }
      })
      .catch(() => {
        navigator.geolocation.getCurrentPosition(success, error, options);
      });
  });
};

export const sendLocationToServer = async (locationData, apiClient) => {
  try {
    const response = await apiClient.post('/customersite/user-location/', {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy
    });

    console.log('Location sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending location:', error);
    throw error;
  }
};