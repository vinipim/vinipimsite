// import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "node:path";

const app = express();
const server = createServer(app);

// Serve static files from dist directory
app.use(express.static(path.join(process.cwd(), 'dist')));

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

// SPA fallback - serve index.html for all other GET routes
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  } else {
    next();
  }
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
});
