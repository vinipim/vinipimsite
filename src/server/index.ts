import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "node:path";
import fs from "node:fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

console.log("🚀 Starting Vinipim Portfolio Server...");

const app = express();
const server = createServer(app);

console.log("📁 Serving static files from:", path.join(process.cwd(), 'dist'));
console.log("CWD:", process.cwd());
console.log("Dist exists:", fs.existsSync(path.join(process.cwd(), 'dist')));

// Serve static files from dist directory
app.use(express.static(path.join(process.cwd(), 'dist')));

// Basic API middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check - SEMPRE funciona
app.get("/health", (req, res) => {
  console.log("💚 Health check requested");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    database: process.env.DATABASE_URL ? "configured" : "not configured"
  });
});

// tRPC API routes
app.use("/api/trpc", createExpressMiddleware({
  router: appRouter,
  createContext,
}));

console.log("🔄 Setting up SPA fallback...");

// SPA fallback - serve index.html for all other GET routes
app.use((req, res, next) => {
  console.log(`🌐 Request: ${req.method} ${req.path}`);
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'dist', 'index.html');
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
const port = process.env.PORT || 3000;
console.log("🎯 Port:", port);

server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? "Configured" : "Not configured"}`);
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
