import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import DataPlot from "./DataPlot";

const Saved = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFileName, setNewFileName] = useState("");
  const [fileToDelete, setFileToDelete] = useState("");
  const [editingFile, setEditingFile] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(""); // Filename of the selected file
  const [plotData, setPlotData] = useState(null); // State to hold plot data

  const toast = useToast();

  const { userData } = useAuth();
  const username = userData.username.split("@")[0];

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fetch/${username}`
      );
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error fetching files",
        description: error.response
          ? error.response.data.message
          : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [username, toast]);

  // Function to fetch the file content for plotting
  const fetchPlotData = async (filename) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fetch/${username}/file/${filename}`
      );
      setPlotData(response.data.content); // Set the plot data
    } catch (error) {
      console.error("Error fetching plot data:", error);
      toast({
        title: "Error fetching plot data",
        description: error.response
          ? error.response.data.message
          : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to handle file renaming
  const handleRename = async (oldFilename) => {
    const fileExtension = oldFilename.split(".").pop();
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/fetch/${username}/edit`,
        {
          oldFilename,
          newFilename: `${newFileName}.${fileExtension}`,
        }
      );
      toast({
        title: "File renamed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewFileName("");
      setEditingFile("");
      fetchFiles();
    } catch (error) {
      console.error("Error renaming file:", error);
      toast({
        title: "Error renaming file",
        description: error.response
          ? error.response.data.message
          : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to handle file deletion
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/fetch/${username}/delete`,
        {
          data: { filename: fileToDelete },
        }
      );
      toast({
        title: "File deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDeleteModalOpen(false);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error deleting file",
        description: error.response
          ? error.response.data.message
          : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to open plot modal
  const handlePlotOpen = (filename) => {
    setSelectedFile(filename); // Set the selected file name
    fetchPlotData(filename); // Fetch plot data for the selected file
    setIsPlotModalOpen(true);
  };

  return (
    <Box p={5}>
      <Heading mb={5}>Saved Data for {userData.username}</Heading>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table variant="striped" colorScheme="teal" size="sm">
          <Thead>
            <Tr>
              <Th>Filename</Th>
              <Th>Size (bytes)</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.length > 0 ? (
              files.map((file, index) => (
                <Tr key={index}>
                  <Td>{file.filename}</Td>
                  <Td>{file.size}</Td>
                  <Td>{new Date(file.createdAt).toLocaleString()}</Td>
                  <Td>
                    {editingFile === file.filename ? (
                      <FormControl display="inline-block" width="200px">
                        <FormLabel htmlFor="newFileName" display="none">
                          New Filename
                        </FormLabel>
                        <Input
                          id="newFileName"
                          placeholder="New filename"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                        />
                        <Button
                          mt={2}
                          colorScheme="blue"
                          leftIcon={<EditIcon />}
                          onClick={() => handleRename(file.filename)}
                        >
                          Rename
                        </Button>
                      </FormControl>
                    ) : (
                      <>
                        <Button
                          mt={2}
                          colorScheme="blue"
                          leftIcon={<EditIcon />}
                          onClick={() => {
                            setNewFileName(file.filename.split(".")[0]);
                            setEditingFile(file.filename);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          mt={2}
                          colorScheme="green"
                          onClick={() => handlePlotOpen(file.filename)}
                        >
                          Plot
                        </Button>
                      </>
                    )}
                    <IconButton
                      mt={2}
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      aria-label="Delete"
                      onClick={() => {
                        setFileToDelete(file.filename);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  No saved files found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
      <Button
        mt={5}
        colorScheme="teal"
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete "{fileToDelete}"?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Plot Modal */}
      <Modal
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Plotting for {selectedFile}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Pass the plot data to the DataPlot component */}
            {plotData ? (
              <DataPlot file_name={selectedFile} plotData={plotData} /> // Pass selectedFile as file_name
            ) : (
              <Text>Loading plot data...</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => setIsPlotModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Saved;
