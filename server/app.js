const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const loginRoute = require("./api/routes/login");
const uploadRoutes = require("./api/routes/upload");

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/auth", loginRoute);
app.use("/upload", uploadRoutes);

module.exports = app;
