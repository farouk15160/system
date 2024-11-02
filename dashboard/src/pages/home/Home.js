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
  Select,
  Spinner,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { DeleteIcon } from "@chakra-ui/icons";
import Plot from "react-plotly.js";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
const Home = () => {
  const toast = useToast();
  const { userData } = useAuth();

  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [yAxisKey, setYAxisKey] = useState("");
  const [plotType, setPlotType] = useState("single");
  const [graphType, setGraphType] = useState("line");
  const [plotedData, setPlotedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
          setHeaders(Object.keys(jsonData[0]));
        }

        setFileData(jsonData);
        setFileName(uploadedFile.name);
        setFile(uploadedFile);
        setLoading(false);

        toast({
          title: "File displayed successfully",
          description: `${uploadedFile.name} has been uploaded`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };
  const handleHeaderChange = (index, newHeader) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index] = newHeader;
    setHeaders(updatedHeaders);
    const updatedData = fileData.map((row) => {
      const newRow = {};
      Object.entries(row).forEach(([key, value], i) => {
        newRow[updatedHeaders[i]] = value;
      });
      return newRow;
    });
    setFileData(updatedData);
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
    setYAxisKey("");
    setPlotedData([]);
    setHeaders([]);
    toast({
      title: "File removed",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteRow = (rowIndex) => {
    const updatedData = fileData.filter((_, index) => index !== rowIndex);
    setFileData(updatedData);
    toast({
      title: "Row deleted",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpload = () => {
    if (!file) return;

    if (!yAxisKey) {
      toast({
        title: "Y-Axis selection required",
        description: "Please select a Y-Axis column before plotting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const plotData = [];
    for (const column of Object.keys(fileData[0])) {
      if (column !== yAxisKey) {
        const xValues = fileData.map((row) => row[column]);
        const yValues = fileData.map((row) => row[yAxisKey]);
        const plot = {
          x: xValues,
          y: yValues,
          type: graphType,
          mode: graphType === "scatter" ? "markers" : undefined,
          name: `${yAxisKey} vs ${column}`,
        };
        plotData.push(plot);
      }
    }

    setPlotedData(plotData);
  };

  const handleSave = async () => {
    if (!fileData.length) {
      toast({
        title: "No data to save",
        description: "Please upload a file and plot the data first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/${
          userData.username.split("@")[0]
        }`,
        {
          y_axis_key: "temperature",
          plot_type: "single",
          graph_type: "line",
          data: fileData,
        }
      );

      toast({
        title: "Data saved successfully",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving data",
        description: error.message || "Something went wrong!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
          {loading && <Spinner size="xl" color="teal.500" />}{" "}
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
              <Box
                overflow="auto"
                width="100%"
                borderWidth={1}
                borderRadius="md"
                p={4}
                boxShadow="md"
                bg="white"
              >
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg="gray.100" zIndex={1}>
                    <Tr>
                      {headers.map((header, index) => (
                        <Th key={index} textAlign="center">
                          <HStack spacing={2}>
                            <Radio
                              value={header}
                              isChecked={yAxisKey === header}
                              onChange={() => setYAxisKey(header)}
                            />
                            <Input
                              value={header}
                              onChange={(e) =>
                                handleHeaderChange(index, e.target.value)
                              }
                              size="sm"
                              variant="flushed"
                            />
                          </HStack>
                        </Th>
                      ))}
                      <Th></Th> {/* For delete icon */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {fileData.map((row, rowIndex) => (
                      <Tr key={rowIndex} _hover={{ bg: "gray.50" }}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <Td key={cellIndex} textAlign="center">
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) =>
                                handleCellChange(rowIndex, key, e.target.value)
                              }
                              variant="flushed"
                            />
                          </Td>
                        ))}
                        <Td>
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleDeleteRow(rowIndex)}
                            colorScheme="red"
                            size="sm"
                            aria-label="Delete row"
                            _hover={{ color: "white", bg: "red.600" }}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              {/* <HStack spacing={4} mt={5}>
                <Button colorScheme="teal" size="md" onClick={handleUpload}>
                  Plot Data
                </Button>
                <Button colorScheme="blue" size="md" onClick={handleSave}>
                  Save Data
                </Button>
                {plotedData.length > 0 && (
                  <Button
                    colorScheme="red"
                    size="md"
                    onClick={() => setPlotedData([])}
                  >
                    Reset Plots
                  </Button>
                )}
              </HStack> */}
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
              <Button colorScheme="teal" onClick={handleUpload} mt={3}>
                Plot Data
              </Button>
              <Button colorScheme="blue" onClick={handleSave} mt={3}>
                Save Data
              </Button>
              {plotedData.length > 0 && (
                <Button
                  colorScheme="red"
                  onClick={() => setPlotedData([])}
                  mt={3}
                >
                  Reset Plots
                </Button>
              )}
            </>
          )}
          {plotedData.length > 0 && (
            <VStack spacing={5} mt={5}>
              {plotType === "single" ? (
                <Box
                  width="100%"
                  borderWidth={1}
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Plot
                    data={plotedData}
                    layout={{
                      title: "Data Visualization",
                      xaxis: { title: "X-Axis" },
                      yaxis: { title: yAxisKey },
                    }}
                    config={{ responsive: true }}
                  />
                </Box>
              ) : (
                plotedData.map((data, index) => (
                  <Box
                    key={index}
                    width="100%"
                    borderWidth={1}
                    borderRadius="lg"
                    overflow="hidden"
                  >
                    <Plot
                      data={[data]}
                      layout={{
                        title: data.name,
                        xaxis: { title: "X-Axis" },
                        yaxis: { title: yAxisKey },
                      }}
                      config={{ responsive: true }}
                    />
                  </Box>
                ))
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Home;
