import React from "react";
import { Box, Heading, Button } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box p={5}>
      <Heading>Welcome to the Home Page</Heading>
      <Button colorScheme="teal" onClick={handleLogout} mt={5}>
        Logout
      </Button>
    </Box>
  );
};

export default Home;
