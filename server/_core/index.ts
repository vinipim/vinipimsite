import "dotenv/config"
import express from "express"
import { createServer } from "http"
import net from "net"
import path from "path"
import fs from "fs"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { registerOAuthRoutes } from "./oauth"
import { appRouter } from "../routers"
import { createContext } from "./context"
import { serveStatic, setupVite } from "./vite"

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
    if (await isPortAvailable(port)) return port
  }
  throw new Error(`No available port found starting from ${startPort}`)
}

async function startServer() {
  const app = express()
  const server = createServer(app)

  app.use(express.json({ limit: "50mb" }))
  app.use(express.urlencoded({ limit: "50mb", extended: true }))

  registerOAuthRoutes(app)

  // Health check para Railway
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
  })

  // API TRPC
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  // Ambiente
  const env = process.env.NODE_ENV || "development"

  if (env === "development") {
    await setupVite(app, server)
  } else {
    // Caminho absoluto para os arquivos estáticos
    const distPath = path.join(process.cwd(), "dist/public")

    if (!fs.existsSync(distPath)) {
      console.error(`❌ Diretório estático não encontrado: ${distPath}`)
      console.error("Execute 'pnpm build' antes de iniciar o servidor.")
      process.exit(1)
    }

    console.log(`📂 Servindo arquivos estáticos de: ${distPath}`)
    serveStatic(app, distPath)
  }

  // Porta (Railway fornece PORT)
  const port = parseInt(process.env.PORT || "3000", 10)
  const finalPort = env === "production" ? port : await findAvailablePort(port)

  server.listen(finalPort, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${finalPort}`)
    console.log(`Environment: ${env}`)
    console.log(
      `Database: ${process.env.DATABASE_URL ? "Connected" : "Not configured"}`
    )
  })
}

startServer().catch(console.error)
