const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const loginRoute = require("./api/routes/login");

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/auth", loginRoute);

module.exports = app;
