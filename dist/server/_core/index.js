var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "../context";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../../dist");
const isProduction = process.env.NODE_ENV === "production";
console.log("\u{1F680} Starting Vinipim Portfolio Server...");
console.log("\u{1F4C1} Serving static files from:", distPath);
console.log("Dist exists:", fs.existsSync(distPath));
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/health", (req, res) => {
    console.log("\u{1F49A} Health check requested");
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "production"
    });
  });
  app.use("/api/trpc", createExpressMiddleware({
    router: appRouter,
    createContext
  }));
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api/")) {
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Not found");
        }
      } else {
        next();
      }
    });
  } else {
    console.warn("\u26A0\uFE0F Dist directory not found, only API routes available");
  }
  const port = parseInt(process.env.PORT || "8080", 10);
  console.log("\u{1F3AF} Port:", port);
  server.listen(port, "0.0.0.0", () => {
    console.log(`\u2705 Server running on port ${port}`);
    console.log(`\u{1F30D} Environment: ${process.env.NODE_ENV || "production"}`);
    console.log(`\u{1F4BE} Database: ${process.env.MYSQLHOST ? "Configured" : "Not configured"}`);
    console.log(`\u{1F517} Health check: http://localhost:${port}/health`);
    if (fs.existsSync(distPath)) {
      console.log(`\u{1F4F1} Frontend: Available at http://localhost:${port}`);
    }
  });
  process.on("uncaughtException", (err) => {
    console.error("\u274C Uncaught Exception:", err);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("\u274C Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });
}
__name(startServer, "startServer");
startServer().catch(console.error);
