import "dotenv/config"
import express from "express"
import { createServer } from "http"
import net from "net"
import path from "path"
import { fileURLToPath } from "url"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { registerOAuthRoutes } from "./oauth"
import { appRouter } from "../routers"
import { createContext } from "./context"
import { serveStatic, setupVite } from "./vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.close(() => resolve(true))
    })
    server.on("error", () => resolve(false))
  })
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port
    }
  }
  throw new Error(`No available port found starting from ${startPort}`)
}

async function startServer() {
  try {
    const app = express()
    const server = createServer(app)

    app.use(express.json({ limit: "50mb" }))
    app.use(express.urlencoded({ limit: "50mb", extended: true }))

  registerOAuthRoutes(app)

  // Health check endpoint for Railway with database connectivity check
  app.get("/health", async (req, res) => {
    try {
      // Import here to avoid circular dependencies
      const { checkDatabaseConnection } = await import("../db");
      
      // Check database connectivity
      const isDatabaseConnected = await checkDatabaseConnection();
      
      if (isDatabaseConnected) {
        res.status(200).json({ 
          status: "ok", 
          database: "connected",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        });
      } else {
        // If database is not connected, return 503 Service Unavailable
        res.status(503).json({ 
          status: "error", 
          database: "disconnected",
          timestamp: new Date().toISOString(),
          message: "Database connection failed"
        });
      }
    } catch (error) {
      console.error("[Health Check] Error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Health check failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Root endpoint for Railway health checks
  app.get("/", (req, res) => {
    res.status(200).send("Vinipim Portfolio API is running");
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  )

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server)
  } else {
    const distPublicPath = path.join(__dirname, "public")
    serveStatic(app, distPublicPath)
  }

    // Railway/Cloud platforms provide PORT env variable and we should use it directly
  const port = Number.parseInt(process.env.PORT || "3000")
  const host = process.env.HOST || "0.0.0.0"
  
  // In production, use the provided port directly without checking availability
  if (process.env.NODE_ENV === "production") {
    server.listen(port, host, () => {
      console.log(`🚀 Server running in PRODUCTION mode on ${host}:${port}`)
      console.log(`🌐 Health check: http://${host}:${port}/health`)
    })
  } else {
    // In development, check for port availability
    const availablePort = await findAvailablePort(port)
    
    if (availablePort !== port) {
      console.log(`⚠️  Port ${port} is busy, using port ${availablePort} instead`)
    }
    
    server.listen(availablePort, () => {
      console.log(`🛠️  Server running in DEVELOPMENT mode on http://localhost:${availablePort}/`)
    })
  }
}

startServer().catch(console.error)
