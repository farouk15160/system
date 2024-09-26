import React from "react";
import { Box, Button, VStack, IconButton } from "@chakra-ui/react";
import {
  FiHome,
  FiUpload,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiSave,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isExpanded, setIsExpanded }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      w={{
        base: isExpanded ? "200px" : "80px",
        md: isExpanded ? "250px" : "80px",
      }}
      bg="gray.700"
      color="white"
      p={5}
      display="flex"
      flexDirection="column"
      position="fixed"
      top="10px"
      left="10px"
      alignItems="center"
      height="100vh"
      borderRadius="md"
      transition="width 0.3s"
    >
      <IconButton
        icon={isExpanded ? <FiChevronLeft /> : <FiMenu />}
        onClick={toggleSidebar}
        alignSelf="flex-end"
        mb={5}
        bg="gray.600"
        color="white"
        _hover={{ bg: "gray.500" }}
      />
      <VStack spacing={5} w="full">
        <Button
          w="full"
          leftIcon={<FiHome />}
          variant="ghost"
          justifyContent={isExpanded ? "flex-start" : "center"}
          color="gray.200"
          _hover={{ bg: "gray.600", color: "white" }}
          onClick={() => {
            navigate("/home");
          }}
        >
          {isExpanded && "Home"}
        </Button>
        <Button
          w="full"
          leftIcon={<FiSave />}
          variant="ghost"
          justifyContent={isExpanded ? "flex-start" : "center"}
          color="gray.200"
          _hover={{ bg: "gray.600", color: "white" }}
          onClick={() => {
            navigate("/saved");
          }}
        >
          {isExpanded && "Saved"}
        </Button>
        <Button
          w="full"
          leftIcon={<FiUpload />}
          variant="ghost"
          justifyContent={isExpanded ? "flex-start" : "center"}
          color="gray.200"
          onClick={() => {
            navigate("/home");
          }}
          _hover={{ bg: "gray.600", color: "white" }}
        >
          {isExpanded && "Upload"}
        </Button>
        <Button
          w="full"
          leftIcon={<FiLogOut />}
          variant="ghost"
          justifyContent={isExpanded ? "flex-start" : "center"}
          color="gray.200"
          _hover={{ bg: "gray.600", color: "white" }}
          onClick={handleLogout}
        >
          {isExpanded && "Logout"}
        </Button>
      </VStack>
    </Box>
  );
};

export default Navbar;
