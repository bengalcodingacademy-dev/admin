import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
let logoutHandler = null;
let isInitialCheck = true;

export function onLogout(handler) {
  logoutHandler = handler;
}

export function setInitialCheckComplete() {
  isInitialCheck = false;
}

export const api = axios.create({ 
  baseURL: API_BASE,
  withCredentials: true // Enable cookies
});

// Request interceptor for additional configuration
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  res => {
    console.log('Sauvik --- API response successful:', res.config.url, res.status);
    return res;
  },
  async err => {
    console.log('Sauvik --- API response error:', err.config?.url, err.response?.status, err.response?.data);
    if (err.response && err.response.status === 401) {
      const errorCode = err.response.data?.code;
      console.log('Sauvik --- 401 error detected, code:', errorCode, 'isInitialCheck:', isInitialCheck);
      
      // Don't trigger logout during initial auth check
      if (isInitialCheck) {
        console.log('Sauvik --- Skipping logout during initial check');
        return Promise.reject(err);
      }
      
      if (errorCode === 'TOKEN_EXPIRED') {
        console.log('Sauvik --- Token expired, triggering logout');
        // Show token expired message
        if (logoutHandler) {
          logoutHandler('Your session has expired. Please login again.');
        }
      } else {
        console.log('Sauvik --- Regular unauthorized, triggering logout');
        // Regular unauthorized
        if (logoutHandler) {
          logoutHandler();
        }
      }
    }
    return Promise.reject(err);
  }
);
