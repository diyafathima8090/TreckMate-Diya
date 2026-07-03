import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // For fallback to cookies if needed
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    let activeRole = 'trekker';
    let token = null;

    if (typeof window !== 'undefined') {
      let headerRole = null;
      if (config.headers) {
        if (typeof config.headers.get === 'function') {
          headerRole = config.headers.get('x-active-role');
        } else {
          // Fallbacks for older Axios versions or plain objects
          headerRole = config.headers['x-active-role'] || config.headers['X-Active-Role'];
        }
      }
      
      // Get role and token from sessionStorage for strict tab isolation
      activeRole = headerRole || sessionStorage.getItem('trekmate_role') || 'trekker';
      token = sessionStorage.getItem('trekmate_token');
    }
    
    // Set the x-active-role header
    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('x-active-role', activeRole);
      } else {
        config.headers['x-active-role'] = activeRole;
      }
    }

    // If token exists, add it to the headers
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
