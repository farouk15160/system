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
  Radio,
  RadioGroup,
  HStack,
  Flex,
  Select,
  Checkbox,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const toast = useToast();
  const { userData } = useAuth();

  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [plotedData, setPlotedData] = useState([]);
  const [yAxisKey, setYAxisKey] = useState("");
  const [plotType, setPlotType] = useState("single");
  const [graphType, setGraphType] = useState("line");
  const [savePlot, setSavePlot] = useState(false);

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

  const handleCellChange = (rowIndex, key, value) => {
    const updatedData = [...fileData];
    updatedData[rowIndex][key] = value;
    setFileData(updatedData);
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

  const handleResetPlots = () => {
    setPlotedData([]);
    setFile(null);
    setFileData([]);
    setFileName("");
    setYAxisKey("");
    setPlotType("single");
    setGraphType("line");
    setSavePlot(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!yAxisKey) {
      toast({
        title: "Y-Axis selection required",
        description: "Please select a Y-Axis column before uploading.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);

    // Create a new workbook and sheet from the edited data
    const worksheet = XLSX.utils.json_to_sheet(fileData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Sheet1");

    // Convert the workbook to a binary array
    const binaryData = XLSX.write(newWorkbook, {
      bookType: "xlsx",
      type: "array",
    });

    const newFile = new Blob([binaryData], {
      type: "application/octet-stream",
    });
    const formData = new FormData();
    formData.append("file", newFile, fileName);
    formData.append("y_axis_key", yAxisKey);
    formData.append("plot_type", plotType);
    formData.append("graph_type", graphType);
    formData.append("save_plot", savePlot);

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
        const data = response.data.data;

        if (Array.isArray(data)) {
          setPlotedData(data);
        } else {
          setPlotedData([data]);
        }

        toast({
          title: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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
                    <Th>Choose the Y-Axis</Th>
                    <Tr>
                      {fileData.length > 0 &&
                        Object.keys(fileData[0]).map((key, index) => (
                          <Th key={key}>
                            <HStack>
                              <Radio
                                value={key}
                                isChecked={yAxisKey === key}
                                onChange={() => setYAxisKey(key)}
                              />
                              <Box>{key}</Box>
                            </HStack>
                          </Th>
                        ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {fileData.map((row, rowIndex) => (
                      <Tr key={rowIndex}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <Td key={cellIndex}>
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) =>
                                handleCellChange(rowIndex, key, e.target.value)
                              }
                            />
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <RadioGroup
                onChange={setPlotType}
                value={plotType}
                mt={3}
                alignSelf="flex-start"
              >
                <HStack spacing={5}>
                  <Radio value="single">Single Plot</Radio>
                  <Radio value="multiple">Multiple Plots</Radio>
                </HStack>
              </RadioGroup>
              <Select
                placeholder="Select Graph Type"
                onChange={(e) => setGraphType(e.target.value)}
                value={graphType}
                mt={3}
                alignSelf="flex-start"
              >
                <option value="line">Line Plot</option>
                <option value="scatter">Scatter Plot</option>
                <option value="bar">Bar Plot</option>
              </Select>
              <Checkbox
                isChecked={savePlot}
                onChange={(e) => setSavePlot(e.target.checked)}
                mt={3}
                alignSelf="flex-start"
              >
                Save Plot
              </Checkbox>
              <Button
                colorScheme="teal"
                onClick={handleUpload}
                isLoading={isUploading}
                loadingText="Uploading"
                mt={3}
              >
                Upload Data
              </Button>
              {plotedData.length > 0 && (
                <Button colorScheme="red" onClick={handleResetPlots} mt={3}>
                  Reset Plots
                </Button>
              )}
            </>
          )}
          {plotedData.length > 0 && (
            <VStack spacing={5} mt={5}>
              {plotedData.map((svg, index) => (
                <Box key={index} dangerouslySetInnerHTML={{ __html: svg }} />
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Home;
