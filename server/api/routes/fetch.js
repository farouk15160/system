const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Define constants for database paths
const DATABASE_DIR = path.join(__dirname, "../../database");

router.use(express.json());

// Fetch saved files
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const normalizedUsername = username.toLowerCase();
  const userDir = path.join(DATABASE_DIR, `${normalizedUsername}/saved`);

  try {
    const files = fs.readdirSync(userDir);
    const fileData = files.map((file) => {
      const filePath = path.join(userDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    });

    res.status(200).json({ files: fileData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch data", error: error.message });
  }
});

// Rename a file
router.put("/:username/edit", async (req, res) => {
  const { username } = req.params;
  const { oldFilename, newFilename } = req.body;
  const normalizedUsername = username.toLowerCase();
  const userDir = path.join(DATABASE_DIR, `${normalizedUsername}/saved`);

  // Construct full file paths
  const oldFilePath = path.join(userDir, oldFilename);

  // Get the file extension from the old filename
  const fileExtension = path.extname(oldFilename);

  // Construct the new filename with the original extension
  const newFilePath = path.join(userDir, `${newFilename}${fileExtension}`);

  try {
    // Rename the file
    fs.renameSync(oldFilePath, newFilePath);
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.error("Error renaming file:", error);
    res
      .status(500)
      .json({ message: "Failed to rename file", error: error.message });
  }
});

// Delete a file
router.delete("/:username/delete", async (req, res) => {
  const { username } = req.params;
  const { filename } = req.body; // Filename to delete
  const normalizedUsername = username.toLowerCase();
  const userDir = path.join(DATABASE_DIR, `${normalizedUsername}/saved`);

  // Construct full file path
  const filePath = path.join(userDir, filename);

  try {
    // Delete the file
    fs.unlinkSync(filePath);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ message: "Failed to delete file", error: error.message });
  }
});

// New endpoint to fetch the contents of a specific file
router.get("/:username/file/:filename", async (req, res) => {
  const { username, filename } = req.params;

  const normalizedUsername = username.toLowerCase();
  const userDir = path.join(DATABASE_DIR, `${normalizedUsername}/saved`);

  // Construct full file path
  const filePath = path.join(userDir, filename);

  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, "utf-8");
    res.status(200).json({ filename, content: fileContent });
  } catch (error) {
    console.error("Error reading file:", error);
    res
      .status(500)
      .json({ message: "Failed to read file", error: error.message });
  }
});

module.exports = router;
