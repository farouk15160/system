const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const users = require("../../users.json");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(express.json());

router.post("/:username", upload.single("file"), async (req, res) => {
  const { username } = req.params;
  const { y_axis_key, plot_type, graph_type, save_plot } = req.body;
  const normalizedUsername = username.toLowerCase();

  console.log("Received upload request from user:", normalizedUsername);

  // Find user by username
  const user = users.find(
    (u) => u.username.split("@")[0] === normalizedUsername
  );
  if (!user) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "User not found.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "No file uploaded.",
    });
  }

  const { originalname, buffer } = req.file;
  const fileType = path.extname(originalname).toLowerCase();

  if (fileType !== ".xlsx" && fileType !== ".csv") {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Only .xlsx and .csv files are allowed.",
    });
  }

  // Validate additional inputs
  if (!y_axis_key) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Y-axis key is required.",
    });
  }

  if (!["single", "multiple"].includes(plot_type)) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Invalid plot type. Must be 'single' or 'multiple'.",
    });
  }

  if (!["line", "scatter", "bar"].includes(graph_type)) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Invalid graph type. Must be 'line', 'scatter', or 'bar'.",
    });
  }

  // Save the file to the user's folder
  const userFolder = path.join(__dirname, "../../data", normalizedUsername);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  const filePath = path.join(userFolder, originalname);
  fs.writeFileSync(filePath, buffer);

  console.log("File saved at:", filePath);

  // Call the Python script with additional arguments
  const python = spawn("python3.10.exe", [
    "plot.py",
    filePath,
    y_axis_key,
    plot_type,
    graph_type,
  ]);

  let svgFilePaths = [];

  python.stdout.on("data", (data) => {
    const paths = data.toString().trim().split("\n");
    svgFilePaths = svgFilePaths.concat(paths.map((p) => p.trim())); // Trim each path
    console.log("Python stdout (SVG file paths):", svgFilePaths);
  });

  python.stderr.on("data", (data) => {
    console.error("Python stderr:", data.toString());
  });

  python.on("close", (code) => {
    console.log("Python process closed with code:", code);

    if (code === 0 && svgFilePaths.length > 0) {
      if (save_plot === "true") {
        // Save the plots to the 'saved' folder
        const savedFolder = path.join(userFolder, "saved");
        if (!fs.existsSync(savedFolder)) {
          fs.mkdirSync(savedFolder);
        }

        svgFilePaths.forEach((svgFilePath) => {
          const fileName = path.basename(svgFilePath);
          const destination = path.join(savedFolder, fileName);
          if (fs.existsSync(svgFilePath)) {
            fs.renameSync(svgFilePath, destination);
          }
        });

        res.status(200).json({
          status: 200,
          success: true,
          message: "File uploaded, processed, and saved successfully.",
          data: svgFilePaths,
        });
      } else {
        // Read the SVG files and send them to the frontend, then delete them
        const svgDataArray = svgFilePaths
          .map((svgFilePath) => {
            if (fs.existsSync(svgFilePath)) {
              const data = fs.readFileSync(svgFilePath, "utf-8");
              fs.unlinkSync(svgFilePath); // Delete the file after reading it
              return data;
            }
            return null;
          })
          .filter((data) => data !== null);

        res.status(200).json({
          status: 200,
          success: true,
          message: "File uploaded and processed successfully.",
          data: svgDataArray,
        });
      }
    } else {
      res.status(500).json({
        status: 500,
        success: false,
        message: "Failed to process the file.",
      });
    }
  });
});

module.exports = router;
