import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupVite } from "./vite";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use((req, res, next) => {
    try {
      express.json({ limit: "50mb" })(req, res, next);
    } catch (error) {
      console.error("JSON middleware error:", error);
      next();
    }
  });
  app.use((req, res, next) => {
    try {
      express.urlencoded({ limit: "50mb", extended: true })(req, res, next);
    } catch (error) {
      console.error("URL-encoded middleware error:", error);
      next();
    }
  });
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  registerOAuthRoutes(app);
  app.get("/", (req, res) => {
    try {
      res.status(200).send("Vinipim Portfolio API is running");
    } catch (error) {
      console.error("Root endpoint error:", error);
      res.status(500).send("Internal server error");
    }
  });
  app.use("/api/trpc", (req, res, next) => {
    try {
      createExpressMiddleware({
        router: appRouter,
        createContext
      })(req, res, next);
    } catch (error) {
      console.error("tRPC middleware error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  const env = process.env.NODE_ENV || "development";
  if (env === "development") {
    try {
      await setupVite(app, server);
      console.log("\u2705 Vite development server setup complete");
    } catch (error) {
      console.error("\u274C Vite setup failed:", error);
    }
  }
  let finalPort;
  try {
    const port = parseInt(process.env.PORT || "3000", 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${process.env.PORT}`);
    }
    finalPort = env === "production" ? port : await findAvailablePort(port);
  } catch (error) {
    console.error("Port resolution failed:", error);
    finalPort = 3e3;
  }
  console.log("\u{1F680} Server starting on port:", finalPort);
  console.log("\u{1F3E5} Health endpoint ready at /health");
  console.log("\u{1F3E0} Root endpoint ready at /");
  server.listen(finalPort, "0.0.0.0", () => {
    console.log(`\u2705 Server running on port ${finalPort}`);
    console.log(`\u{1F30D} Environment: ${env}`);
    console.log(`\u{1F4BE} Database: ${process.env.DATABASE_URL ? "Configured" : "Not configured"}`);
    console.log(`\u{1F517} Health check: http://localhost:${finalPort}/health`);
  });
  app.use((error, req, res, next) => {
    console.error(`\u274C Unhandled error in ${req.method} ${req.path}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        path: req.path,
        method: req.method
      });
    }
  });
  app.use((req, res) => {
    console.warn(`\u26A0\uFE0F Route not found: ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(404).json({
        error: "Not found",
        path: req.path,
        method: req.method
      });
    }
  });
  process.on("uncaughtException", (error) => {
    console.error("\u274C Uncaught Exception:", error);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("\u274C Unhandled Rejection at:", promise, "reason:", reason);
  });
}
startServer().catch(console.error);
