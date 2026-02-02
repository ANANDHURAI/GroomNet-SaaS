import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authEndpoints = [
  '/auth/admin-login/',
  '/auth/customer-barber-login/',
  '/auth/google-login/',
  '/auth/register/',
  '/auth/token/', 
  '/auth/otp-verification/',
  '/barber-reg/personal-details/',
  '/barber-reg/verify-otp/',
  '/barber-reg/resend-otp/',
];

const isAuthRequest = (url) => {
  const path = url?.startsWith('/') ? url : `/${url}`;
  return authEndpoints.some(endpoint => path === endpoint || path.startsWith(endpoint));
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config) => {
    if (!isAuthRequest(config.url)) {
      const token = sessionStorage.getItem("access_token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
    
      if (isAuthRequest(originalRequest.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = sessionStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");
        const response = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        sessionStorage.setItem("access_token", newAccessToken);

        onRefreshed(newAccessToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;