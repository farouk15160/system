import React, { useEffect, useState } from "react";
import {
  Box,
  Select,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Plot from "react-plotly.js";

const DataPlot = ({ file_name }) => {
  const [data, setData] = useState([]); // Data for plotting
  const [yAxes, setYAxes] = useState([]); // Array to hold selected Y-axes
  const [plotType, setPlotType] = useState("scatter"); // Plot type (scatter or bar)
  const [plotStyle, setPlotStyle] = useState("combined"); // Plot style (combined or separate)
  const { userData } = useAuth();
  const username = userData.username.split("@")[0];
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch the data for the selected file
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fetch/${username}/file/${file_name}`
      );

      // Log the full API response
      console.log("API Response:", response.data);

      // Parse the content string from the response
      const parsedData = JSON.parse(response.data.content); // This should be the object containing 'data', 'graph_type', etc.

      console.log("Parsed Data:", parsedData); // Log the parsed data

      setData(parsedData.data); // Set only the data array for plotting
      setError(null); // Reset error state
    } catch (error) {
      console.error(
        "Error fetching or parsing file data:",
        error.response ? error.response.data : error.message
      );
      setError("Error fetching or parsing file data. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, [file_name]);

  // Prepare plot data based on selections
  const getPlotData = () => {
    if (data.length > 0 && yAxes.length > 0) {
      return yAxes
        .map((yAxis) => {
          const yValues = data.map((item) => item[yAxis]);
          const xValues = data.map((item) => item.X); // Use 'X' or 'Time' based on what you want for the X-axis

          console.log(`X Values for ${yAxis}:`, xValues); // Log x values
          console.log(`Y Values for ${yAxis}:`, yValues); // Log y values

          // Check if yValues and xValues are valid for plotting
          if (
            yValues.every((value) => value !== undefined && value !== null) &&
            xValues.every((value) => value !== undefined && value !== null)
          ) {
            return {
              x: xValues,
              y: yValues,
              type: plotType === "bar" ? "bar" : "scatter", // Choose type based on plotType
              mode: plotType === "bar" ? undefined : "lines+markers",
              marker: {
                color: "rgba(75, 192, 192, 1)",
              },
              name: yAxis, // This will be the Y-axis label (like "temperature")
            };
          }
          return null; // Return null if no valid data is found
        })
        .filter((trace) => trace !== null); // Filter out any null traces
    }
    return []; // Return an empty array if no valid data is found
  };

  // Extract available y-axis options from the data keys
  const getYAxisOptions = () => {
    if (data.length > 0) {
      // Assuming your data has keys like temperature, humidity, etc.
      const options = Object.keys(data[0]).filter(
        (key) => key !== "X" && key !== "Time"
      ); // Exclude 'X' and 'Time'
      console.log("Y-axis Options:", options); // Log the Y-axis options
      return options;
    }
    return [];
  };

  return (
    <Box>
      {loading ? ( // Show loading spinner while fetching data
        <Spinner />
      ) : error ? ( // Show error message if there's an error
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <VStack spacing={4}>
          <CheckboxGroup onChange={setYAxes}>
            <Text>Select Y-axes:</Text>
            {getYAxisOptions().map((option) => (
              <Checkbox key={option} value={option}>
                {option}
              </Checkbox>
            ))}
          </CheckboxGroup>

          <RadioGroup onChange={setPlotType} value={plotType}>
            <Text>Choose Plot Type:</Text>
            <Radio value="scatter">Scatter Plot</Radio>
            <Radio value="bar">Bar Plot</Radio>
          </RadioGroup>

          <Select
            onChange={(e) => setPlotStyle(e.target.value)}
            placeholder="Choose Plot Style"
          >
            <option value="combined">Combined Plot</option>
            <option value="separate">Separate Plots</option>
          </Select>

          <Button onClick={() => setPlotType(plotType)}>Generate Plot</Button>
        </VStack>
      )}

      {/* Render the Plotly chart */}
      {data.length > 0 && yAxes.length > 0 && (
        <Box mt={4}>
          {plotStyle === "combined" ? (
            <Plot
              data={getPlotData()}
              layout={{
                title: `Combined Plot for Selected Y-axes`, // Update title dynamically
                xaxis: { title: "X-axis" }, // Change to appropriate label if needed
                yaxis: { title: "Values" }, // General title for the Y-axis
              }}
              config={{ responsive: true }}
            />
          ) : (
            yAxes.map((yAxis) => (
              <Plot
                key={yAxis}
                data={[
                  {
                    x: data.map((item) => item.X),
                    y: data.map((item) => item[yAxis]),
                    type: plotType === "bar" ? "bar" : "scatter",
                    mode: plotType === "bar" ? undefined : "lines+markers",
                    marker: {
                      color: "rgba(75, 192, 192, 1)",
                    },
                    name: yAxis,
                  },
                ]}
                layout={{
                  title: `Plot for ${yAxis}`, // Update title dynamically
                  xaxis: { title: "X-axis" },
                  yaxis: { title: yAxis },
                }}
                config={{ responsive: true }}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default DataPlot;
