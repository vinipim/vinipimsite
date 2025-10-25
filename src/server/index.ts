import "dotenv/config";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

// Health check - SEMPRE funciona
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Root
app.get("/", (req, res) => {
  res.status(200).send("Vinipim Portfolio API is running");
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
});
