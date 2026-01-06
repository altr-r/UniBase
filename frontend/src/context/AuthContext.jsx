import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run this logic ONCE when the app loads
    const initializeAuth = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user data", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array prevents loops

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await api.post("/auth/register", userData);
      toast.success("Registration successful! Please login.");
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.error || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
