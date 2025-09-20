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
  res => res,
  async err => {
    if (err.response && err.response.status === 401) {
      const errorCode = err.response.data?.code;
      
      // Don't trigger logout during initial auth check
      if (isInitialCheck) {
        return Promise.reject(err);
      }
      
      if (errorCode === 'TOKEN_EXPIRED') {
        // Show token expired message
        if (logoutHandler) {
          logoutHandler('Your session has expired. Please login again.');
        }
      } else {
        // Regular unauthorized
        if (logoutHandler) {
          logoutHandler();
        }
      }
    }
    return Promise.reject(err);
  }
);
