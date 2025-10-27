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

console.log("🚀 Starting Vinipim Portfolio Server...");
console.log("📁 Serving static files from:", distPath);
console.log("Dist exists:", fs.existsSync(distPath));

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/health", (req, res) => {
    console.log("💚 Health check requested");
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
    });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

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
    console.warn("⚠️ Dist directory not found, only API routes available");
  }

  const port = parseInt(process.env.PORT || "8080", 10);
  console.log("🎯 Port:", port);

  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
    console.log(`💾 Database: ${process.env.MYSQLHOST ? "Configured" : "Not configured"}`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
    if (fs.existsSync(distPath)) {
      console.log(`📱 Frontend: Available at http://localhost:${port}`);
    }
  });

  process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });
}

startServer().catch(console.error);
