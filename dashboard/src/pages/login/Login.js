import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  useDisclosure,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          username,
          password,
        }
      );
      if (response.data.success) {
        login();
        sessionStorage.setItem("token", response.data.token); // Save the token in session storage
        sessionStorage.setItem("userData", JSON.stringify(response.data.data));
        console.log(JSON.stringify(response.data.data));
        navigate("/home"); // Redirect to the home page
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegisterLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        {
          username: registerUsername,
          password: registerPassword,
        }
      );
      if (response.data.success) {
        setRegisterSuccess("Registration successful. Please login.");
        setRegisterError("");
        onClose(); // Close the modal
      } else {
        setRegisterError(response.data.message);
        setRegisterSuccess("");
      }
    } catch (error) {
      setRegisterError(
        "An error occurred during registration. Please try again."
      );
      setRegisterSuccess("");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <Box
      maxW="sm"
      mx="auto"
      p={5}
      mt={10}
      boxShadow="lg"
      borderRadius="md"
      bg="var(--primary-white)"
    >
      <Box textAlign="center" mb={5}>
        {/* <Logo /> */}
        <Heading mb={5} color="var(--primary-gray)">
          Login
        </Heading>
      </Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      <VStack spacing={3}>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          colorScheme="teal"
          onClick={handleLogin}
          width="full"
          bg="var(--primary-green)"
          color="var(--primary-white)"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "Login"}
        </Button>
        <Text color="var(--primary-gray)">
          Don't have an account?{" "}
          <Button variant="link" colorScheme="teal" onClick={onOpen}>
            Register
          </Button>
        </Text>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {registerError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {registerError}
              </Alert>
            )}
            {registerSuccess && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                {registerSuccess}
              </Alert>
            )}
            <VStack spacing={3}>
              <Input
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={handleRegister}
              bg="var(--primary-green)"
              color="var(--primary-white)"
              disabled={registerLoading}
            >
              {registerLoading ? <Spinner size="sm" /> : "Register"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Login;
