import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <AuthProvider>
      <Box p={5}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
    </AuthProvider>
  );
};

export default App;
