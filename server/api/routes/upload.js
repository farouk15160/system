const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(express.json());

router.post("/:username", upload.single("file"), async (req, res) => {
  const { username } = req.params;
  const { y_axis_key, plot_type, graph_type, data } = req.body; // Expecting data in the body
  const normalizedUsername = username.toLowerCase();

  // Create user-specific directory if it doesn't exist
  const userDir = path.join(
    __dirname,
    `../../data/${normalizedUsername}/saved`
  );
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  // Define the filename for the saved data
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const fileName = `${normalizedUsername}-${timestamp}.json`;
  const filePath = path.join(userDir, fileName);

  try {
    // Write the received data to a JSON file
    fs.writeFileSync(
      filePath,
      // JSON.stringify({ y_axis_key, plot_type, graph_type, data }, null, 2)
      JSON.stringify({ data }, null, 2)
    );

    res.status(200).json({ message: "Data saved successfully", filePath });
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Failed to save data", error: error.message });
  }
});

module.exports = router;
