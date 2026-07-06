import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api',
  withCredentials: true, 
});


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
          
          headerRole = config.headers['x-active-role'] || config.headers['X-Active-Role'];
        }
      }
      
      
      activeRole = headerRole || sessionStorage.getItem('trekmate_role') || 'trekker';
      token = sessionStorage.getItem('trekmate_token');
    }
    
    
    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('x-active-role', activeRole);
      } else {
        config.headers['x-active-role'] = activeRole;
      }
    }

    
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
