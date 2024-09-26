const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const users = require("../../users.json");

router.use(bodyParser.json());

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

  const filePath = path.join(
    __dirname,
    "../../data",
    usernameFolder,
    `${usernameFolder}.json`
  );

  let userData = null;
  if (fs.existsSync(filePath)) {
    userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
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
  fs.writeFileSync(
    path.join(__dirname, "../../users.json"),
    JSON.stringify(users, null, 2)
  );

  // Create a folder named after the username (without the domain part)
  const usernameFolder = username.split("@")[0];
  const folderPath = path.join(__dirname, "../../data", usernameFolder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  // Create a JSON file inside the folder
  const filePath = path.join(folderPath, `${usernameFolder}.json`);
  fs.writeFileSync(filePath, JSON.stringify(newUser, null, 2));

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

module.exports = router;
