const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");

// Define constants for database paths
const DATABASE_DIR = path.join(__dirname, "../../database");
const USERS_FILE = path.join(DATABASE_DIR, "users.json");

router.use(bodyParser.json());

async function ensureFileExists(filePath, initialContent = '') {
  try {
    // Check if the file exists
    await fs.access(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, initialContent);
      } catch (createError) {
        console.error(`Error creating file: ${createError.message}`);
        throw createError;
      }
    } else {
      console.error(`Error checking file: ${error.message}`);
      throw error;
    }
  }
}

async function readJSONFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file: ${error.message}`);
    throw error;
  }
}

async function writeJSONFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing JSON file: ${error.message}`);
    throw error;
  }
}

let users = [];

async function initializeUsers() {
  await ensureFileExists(USERS_FILE, '[]');
  users = await readJSONFile(USERS_FILE);
}

const checkUserAuth = async (username, password) => {
  const user = users.find((u) => u.username === username);

  if (!user) {
    return {
      status: 400,
      success: false,
      data: null,
      message: "Authentication failed. User not found.",
      token: null,
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return {
      status: 400,
      success: false,
      data: null,
      message: "Authentication failed. Wrong password.",
      token: null,
    };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    "your_jwt_secret_key",
    {
      expiresIn: "4h",
    }
  );
  const usernameFolder = username.split("@")[0];

  const filePath = path.join(DATABASE_DIR, usernameFolder, `${usernameFolder}.json`);

  let userData = null;
  try {
    userData = await readJSONFile(filePath);
  } catch (error) {
    console.error(`Error reading user data: ${error.message}`);
  }

  return {
    status: 200,
    success: true,
    data: userData,
    message: "Authentication successful",
    token: token,
  };
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usernameLower = username.toLowerCase();

  const { status, success, data, message, token } = await checkUserAuth(
    usernameLower,
    password
  );

  res.status(status).json({
    status: status,
    success: success,
    data: data,
    message: message,
    token: token,
  });
});
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const usernameLower = username.toLowerCase();
  const { status, success, data, message, token } = await registerUser(
    usernameLower,
    password
  );

  res.status(status).json({
    status: status,
    success: success,
    data: data,
    message: message,
    token: token,
  });
});

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const registerUser = async (username, password) => {
  if (!username || !password) {
    return {
      status: 400,
      success: false,
      data: null,
      message: "Email and password are required.",
      token: null,
    };
  }

  if (!isValidEmail(username)) {
    return {
      status: 400,
      success: false,
      data: null,
      message: "Invalid email format.",
      token: null,
    };
  }

  if (password.length < 8) {
    return {
      status: 400,
      success: false,
      data: null,
      message: "Password must be at least 8 characters long.",
      token: null,
    };
  }

  const existingUser = users.find((u) => u.username === username);

  if (existingUser) {
    return {
      status: 400,
      success: false,
      data: null,
      message: "User already exists.",
      token: null,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length,
    username: username,
    password: hashedPassword,
  };

  users.push(newUser);

  // Save the updated users array to the JSON file
  await writeJSONFile(USERS_FILE, users);

  // Create a folder named after the username (without the domain part)
  const usernameFolder = username.split("@")[0];
  const folderPath = path.join(DATABASE_DIR, usernameFolder);

  await fs.mkdir(folderPath, { recursive: true });

  // Create a JSON file inside the folder
  const filePath = path.join(folderPath, `${usernameFolder}.json`);
  await writeJSONFile(filePath, newUser);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    "your_jwt_secret_key",
    {
      expiresIn: "4h",
    }
  );

  return {
    status: 200,
    success: true,
    data: null,
    message: "Registration successful",
    token: token,
  };
};

// Initialize users when the module is loaded
initializeUsers().catch(error => {
  console.error('Failed to initialize users:', error);
  process.exit(1);
});

module.exports = router;
