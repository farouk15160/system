import React, { createContext, useContext, useState } from "react";

// Create a context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token")
  );
  const [userData, setUserData] = useState(
    JSON.parse(sessionStorage.getItem("userData")) || {}
  );

  const login = (data) => {
    setIsAuthenticated(true);
    setUserData(data);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData({});
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
