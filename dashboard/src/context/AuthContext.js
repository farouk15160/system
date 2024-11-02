import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUserData = sessionStorage.getItem("userData");

    if (token) {
      setIsAuthenticated(true);
    }

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const login = (token, data) => {
    setIsAuthenticated(true);
    setUserData(data);
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userData", JSON.stringify(data));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
