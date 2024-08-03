const https = require("http");
const cors = require("cors");
const app = require("./app");

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors());

const PORT = process.env.PORT || 5540;

const server = https.createServer(app);

server.on("error", (error) => {
  console.error("HTTPS Server error:", error);
});
server.on("listening", () => {
  console.log("Server is listening on port ", PORT);
});

server.listen(PORT, () => {
  console.log("Serving on http://localhost:" + PORT);
});
