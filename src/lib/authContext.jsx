import { createContext, useContext, useEffect, useState } from 'react';
import { onLogout, api, setInitialCheckComplete } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children, navigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status first
    checkAuthStatus();
  }, [navigate]);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/me/summary');
      setUser(response.data);
    } catch (error) {
      // User not authenticated, clear any stale state
      setUser(null);
    } finally {
      setLoading(false);
      setInitialCheckComplete(); // Tell API interceptor that initial check is done
      
      // Set up logout handler AFTER initial check is complete
      onLogout((message) => {
        setUser(null);
        navigate('/login');
        if (message) {
          alert(message);
        }
      });
    }
  };

  function login({ expiresInSec, user }) {
    setUser(user);
    // No need to manage token manually, it's in cookies
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
    
    // Clear all possible client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies that might exist on client side
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Clear cookies for different paths and domains
    const cookiesToClear = [
      'accessToken', 'refreshToken', 'token', 'authToken', 'sessionToken',
      'access_key', 'refresh_key', 'auth_key', 'session_key'
    ];
    
    cookiesToClear.forEach(cookieName => {
      // Clear for current path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Clear for root path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      // Clear for parent domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
    
    // Reset auth state
    setUser(null);
    
    // Navigate to admin login
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
