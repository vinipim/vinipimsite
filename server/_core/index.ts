import "dotenv/config"
import express from "express"
import { createServer } from "http"
import net from "net"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { registerOAuthRoutes } from "./oauth"
import { appRouter } from "../routers"
import { createContext } from "./context"
import { serveStatic, setupVite } from "./vite"
import path from "path" // <— adicionado

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
  const app = express()
  const server = createServer(app)

  app.use(express.json({ limit: "50mb" }))
  app.use(express.urlencoded({ limit: "50mb", extended: true }))

  registerOAuthRoutes(app)

  // Health check endpoint for Railway
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
  })

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  )

  // Ambiente de desenvolvimento usa Vite
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server)
  } else {
    // Em produção, servir os arquivos estáticos
    const distPath = path.join(process.cwd(), "dist/public")
    // Se o build gerar "dist" direto, troque a linha acima por:
    // const distPath = path.join(process.cwd(), "dist")
    serveStatic(app, distPath)
  }

  // Railway requer usar a porta exata provida pela variável PORT
  const port = Number.parseInt(process.env.PORT || "3000")

  // Só tenta achar porta alternativa no dev
  const finalPort = process.env.NODE_ENV === "production"
    ? port
    : await findAvailablePort(port)

  if (finalPort !== port && process.env.NODE_ENV !== "production") {
    console.log(`Port ${port} is busy, using port ${finalPort} instead`)
  }

  server.listen(finalPort, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${finalPort}`)
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    console.log(`Database: ${process.env.DATABASE_URL ? "Connected" : "Not configured"}`)
  })
}

startServer().catch(console.error)
