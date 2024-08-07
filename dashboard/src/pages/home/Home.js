import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  VStack,
  Spinner,
  Image,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { DeleteIcon } from "@chakra-ui/icons";
// import Navbar from "../components/Navbar";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const toast = useToast();
  const { userData } = useAuth();

  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [plotedData, setPlotedData] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFileData(jsonData);
        setFileName(uploadedFile.name);
        setFile(uploadedFile);
      };
      reader.readAsArrayBuffer(uploadedFile);

      toast({
        title: "File displayed successfully",
        description: `${uploadedFile.name} has been uploaded`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileData([]);
    setFileName("");
    toast({
      title: "File removed",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/${
          userData.username.split("@")[0]
        }`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        console.log(response.data);
        setPlotedData(response.data.data);
        toast({
          title: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setFile(null);
        setFileData([]);
        setFileName("");
      } else {
        toast({
          title: "Upload failed",
          description: response.data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box display="flex" flexDirection={["column", "row"]}>
      <Box p={5} flex="1">
        <Heading mb={5}>Welcome to the Home Page</Heading>
        <VStack spacing={5}>
          <Input
            type="file"
            accept=".xlsx, .xls, .csv, .json"
            onChange={handleFileUpload}
          />
          {fileName && (
            <>
              <Box display="flex" justifyContent="space-between" width="100%">
                <Heading size="md">{fileName}</Heading>
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={handleRemoveFile}
                  colorScheme="red"
                />
              </Box>
              <Box overflowX="auto" width="100%">
                <Table variant="striped" colorScheme="teal" size="sm">
                  <Thead>
                    <Tr>
                      {fileData.length > 0 &&
                        Object.keys(fileData[0]).map((key) => (
                          <Th key={key}>{key}</Th>
                        ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {fileData.map((row, index) => (
                      <Tr key={index}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <Td key={cellIndex}>{cell}</Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Button
                colorScheme="teal"
                onClick={handleUpload}
                isLoading={isUploading}
                loadingText="Uploading"
              >
                Upload Data
              </Button>
            </>
          )}
          {plotedData && (
            <>
              <div>
                <Heading fontWeight="bold" as="h1">
                  SVG Plot
                </Heading>
                <div dangerouslySetInnerHTML={{ __html: plotedData }} />
              </div>
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Home;
