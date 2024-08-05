const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const users = require("../../users.json");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(express.json());

router.post("/:username", upload.single("file"), async (req, res) => {
  const { username } = req.params;
  console.log(username);
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

  let data;
  if (fileType === ".xlsx") {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(worksheet);
  } else if (fileType === ".csv") {
    data = buffer
      .toString("utf-8")
      .split("\n")
      .map((line) => line.split(","));
  }

  // Save the file to the user's folder
  const userFolder = path.join(__dirname, "../../data", normalizedUsername);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  const filePath = path.join(userFolder, originalname);
  fs.writeFileSync(filePath, buffer);

  res.status(200).json({
    status: 200,
    success: true,
    message: "File uploaded successfully.",
    data: data,
  });
});

module.exports = router;
