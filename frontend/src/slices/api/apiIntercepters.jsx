import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const authEndpoints = [
  '/auth/admin-login/',
  '/auth/customer-barber-login/',
  '/auth/register/',
  '/auth/token/',
  '/auth/otp-verification/',
  '/barber-reg/personal-details/',
  '/barber-reg/verify-otp/',  
  '/barber-reg/resend-otp/',  
];
apiClient.interceptors.request.use(
  (config) => {
    const isAuthEndpoint = authEndpoints.some(endpoint => {
      const url = config.url?.startsWith('/') ? config.url : `/${config.url}`;
      return url === endpoint || url.startsWith(endpoint);
    });

    if (!isAuthEndpoint) {
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

    console.log('Response error for URL:', originalRequest.url, 'Status:', error.response?.status);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/token/refresh/")) {
        return Promise.reject(error); 
      }

      const isAuthEndpoint = authEndpoints.some(endpoint => {
        const url = originalRequest.url?.startsWith('/') ? originalRequest.url : `/${originalRequest.url}`;
        return url === endpoint || url.startsWith(endpoint);
      });

      if (isAuthEndpoint) {
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

        const response = await axios.post("http://localhost:8000/auth/token/refresh/", {
          refresh: refreshToken,
        });

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
