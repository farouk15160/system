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
  const normalizedUsername = username.toLowerCase();

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

  // Save the file to the user's folder
  const userFolder = path.join(__dirname, "../../data", normalizedUsername);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  const filePath = path.join(userFolder, originalname);
  fs.writeFileSync(filePath, buffer);

  // Call the Python script
  const python = spawn("python3.10.exe", ["plot.py", filePath]); // Use the correct executable name

  let svgData = "";

  python.stdout.on("data", (data) => {
    svgData += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    if (code === 0) {
      res.status(200).json({
        status: 200,
        success: true,
        message: "File uploaded and processed successfully.",
        data: svgData,
      });
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
