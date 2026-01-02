// Create src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from "react";
import apiClient from "../lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { user } = await apiClient.getCurrentUser();
      setIsAuthenticated(true);
      setUser(user);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // Check for OAuth callback
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      apiClient.setToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkAuth, 100);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
