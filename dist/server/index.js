// Simple production server for Railway
import express from "express";
import { createServer } from "http";
import path from "node:path";
import fs from "node:fs";

console.log("🚀 Starting Vinipim Portfolio Server...");

const app = express();
const server = createServer(app);

const distPath = path.join(process.cwd(), 'dist');
console.log("📁 Serving static files from:", distPath);
console.log("Dist exists:", fs.existsSync(distPath));

// Serve static files from dist directory
app.use(express.static(distPath));

// Health check - ALWAYS returns 200
app.get("/health", (req, res) => {
  console.log("💚 Health check requested");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
});

console.log("🔄 Setting up SPA fallback...");

// SPA fallback - serve index.html for all other GET routes
app.use((req, res, next) => {
  console.log(`🌐 Request: ${req.method} ${req.path}`);
  if (req.method === 'GET') {
    const filePath = path.join(distPath, 'index.html');
    console.log("📄 Serving index.html from:", filePath);
    console.log("Index.html exists:", fs.existsSync(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  } else {
    next();
  }
});

console.log("🔧 Starting server...");

// Start server
const port = parseInt(process.env.PORT || "8080", 10);
console.log("🎯 Port:", port);

server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
  console.log(`📱 Frontend: Available at http://localhost:${port}`);
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
