import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/Navbar";

const App = () => {
  const [isExpanded, setIsExpanded] = React.useState(true);
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
                <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                <Container isExpanded={isExpanded}>
                  <Home />
                </Container>
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

export const Container = ({ children, isExpanded }) => {
  return (
    <Flex
      w={{
        base: isExpanded ? "calc(100% - 200px)" : "calc(100% - 80px)",
        md: isExpanded ? "calc(100% - 250px)" : "calc(100% - 80px)",
      }}
      transition="all 0.3s"
      paddingLeft={{
        base: isExpanded ? "200px" : "80px",
        md: isExpanded ? "250px" : "80px",
      }}
    >
      {children}
    </Flex>
  );
};
