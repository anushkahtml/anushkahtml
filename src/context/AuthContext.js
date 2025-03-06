import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken") || "");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!authToken);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  const checkTokenExpiration = () => {
    if (authToken) {
      try {
        // If using JWT, check expiration
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token expired
          logout();
          return false;
        }
        return true;
      } catch (e) {
        console.error("Token validation error:", e);
        logout();
        return false;
      }
    }
    return false;
  };

  // Restore auth state on first load
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(JSON.parse(storedUser));
  
      // Add this validation
      if (checkTokenExpiration()) {
        axios
          .get("/api/auth/health-check")
          .then(() => setIsLoggedIn(true))
          .catch(() => logout())
          .finally(() => setIsAuthChecked(true));
      } else {
        // Don't call health-check if token is expired
        setIsAuthChecked(true);
      }
    } else {
      setAuthToken("");
      setUser(null);
      setIsLoggedIn(false);
      setIsAuthChecked(true);
    }
  }, []);

  // Clear user data if authToken is missing on page reload
  useEffect(() => {
    if (!authToken) {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, [authToken]);

  // Store token in localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
    }
  }, [authToken]);

  // Store user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user"); // Clear user data if logged out
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials!");

      const token = response.headers.get("x-auth-token");
      const userData = await response.json();

      if (token) {
        localStorage.setItem("authToken", token); // Store token in localStorage
        localStorage.setItem("user", JSON.stringify(userData)); // Store user data
        setAuthToken(token);
        setUser(userData);
        navigate("/products");
      } else {
        throw new Error("Authentication failed! No token received.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Signup failed!");

      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setAuthToken("");
    setUser(null);
    setIsLoggedIn(false);
    navigate("/");
  };

  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Unauthorized request");

      return await response.json();
    } catch (error) {
      console.error(error.message);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, authToken, isAuthChecked, user, login, signup, logout, fetchData }}>
      {isAuthChecked ? children : null} {/* Prevent rendering before auth check */}
    </AuthContext.Provider>
  );
};