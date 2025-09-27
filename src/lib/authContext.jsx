import { createContext, useContext, useEffect, useState } from "react";
import { onLogout, api, setInitialCheckComplete } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children, navigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(
    "Sauvik --- AuthProvider initialized with user:",
    user,
    "loading:",
    loading
  );

  useEffect(() => {
    console.log("Sauvik --- Auth context useEffect called");
    // Check auth status first
    checkAuthStatus();
  }, [navigate]);

  const checkAuthStatus = async () => {
    try {
      console.log("Sauvik --- Checking auth status...");
      const response = await api.get("/me/summary");
      console.log("Sauvik --- Auth status response:", response.data);
      if (response.data.role !== "ADMIN") {
        console.log("Sauvik --- User is not admin, clearing user");
        setUser(null);
        return;
      }
      console.log("Sauvik --- User is admin, setting user");
      setUser(response.data);
    } catch (error) {
      console.log(
        "Sauvik --- Auth check failed:",
        error.response?.status,
        error.response?.data
      );
      // User not authenticated, clear any stale state
      setUser(null);
    } finally {
      console.log(
        "Sauvik --- Setting loading to false and initial check complete"
      );
      setLoading(false);
      setInitialCheckComplete(); // Tell API interceptor that initial check is done

      // Set up logout handler AFTER initial check is complete
      onLogout((message) => {
        console.log("Sauvik --- Logout handler called with:", message);
        setUser(null);

        navigate("/login");
        if (message && typeof message === "string") {
          alert(message);
        } else if (message) {
          console.error(
            "Sauvik --- Invalid logout message type:",
            typeof message,
            message
          );
        }
      });
    }
  };

  function login({ expiresInSec, user }) {
    console.log("Sauvik --- Login called with user:", user);
    console.log("Sauvik --- Login called with expiresInSec:", expiresInSec);
    setUser(user);
    console.log("Sauvik --- User state updated in login function");
    // No need to manage token manually, it's in cookies
  }

  async function logout() {
    console.log("Sauvik --- Logout function called");
    try {
      await api.post("/auth/logout");
      console.log("Sauvik --- Logout API call successful");
    } catch (error) {
      console.log("Sauvik --- Logout API call failed:", error);
      // Ignore logout errors
    }

    // Clear all possible client-side storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear all cookies that might exist on client side
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Clear cookies for different paths and domains
    const cookiesToClear = [
      "accessToken",
      "refreshToken",
      "token",
      "authToken",
      "sessionToken",
      "access_key",
      "refresh_key",
      "auth_key",
      "session_key",
    ];

    cookiesToClear.forEach((cookieName) => {
      // Clear for current path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Clear for root path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      // Clear for parent domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });

    // Reset auth state
    console.log("Sauvik --- Clearing user state and navigating to login");
    setUser(null);

    // Navigate to admin login
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
