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
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { DeleteIcon } from "@chakra-ui/icons";
import Plot from "react-plotly.js";
import { useAuth } from "../../context/AuthContext";

import axios from "axios"; // Import axios

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
    setYAxisKey("");
    setPlotedData([]);
    toast({
      title: "File removed",
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
      // Send the fileData to your API
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/${
          userData.username.split("@")[0]
        }`,
        {
          y_axis_key: "temperature",
          plot_type: "single",
          graph_type: "line",
          data: fileData, // Ensure fileData is formatted correctly for the server
        }
      );

      toast({
        title: "Data saved successfully",
        description: response.data.message, // Adjust according to your API response
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
                        Object.keys(fileData[0]).map((key) => (
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
                      data={[data]} // Plot only one data set
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
