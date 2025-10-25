import "dotenv/config"
import express from "express"
import { createServer } from "http"
import net from "net"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { registerOAuthRoutes } from "./oauth"
import { appRouter } from "../routers"
import { createContext } from "./context"
import { setupVite } from "./vite"

// ----------------------
// LangChain + Ollama
// ----------------------
import { ChatOllama } from "@langchain/community/chat_models/ollama"
import { ChatPromptTemplate } from "langchain/prompts"
import { RunnableSequence } from "langchain/runnables"

const model = new ChatOllama({ model: "gemma3:1b" })
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Você é um assistente direto e claro."],
  ["human", "{mensagem}"]
])
const chain = RunnableSequence.from([prompt, model])

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express()
  const server = createServer(app)

  app.use(express.json({ limit: "50mb" }))
  app.use(express.urlencoded({ limit: "50mb", extended: true }))

  registerOAuthRoutes(app)

  app.get("/health", async (_req, res) => {
    try {
      const { checkDatabaseConnection } = await import("../db")
      const isDatabaseConnected = await checkDatabaseConnection()
      
      if (isDatabaseConnected) {
        res.status(200).json({ 
          status: "ok", 
          database: "connected",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        })
      } else {
        res.status(503).json({ 
          status: "error", 
          database: "disconnected",
          timestamp: new Date().toISOString(),
          message: "Database connection failed"
        })
      }
    } catch (error) {
      console.error("[Health Check] Error:", error)
      res.status(500).json({ 
        status: "error", 
        message: "Health check failed",
        timestamp: new Date().toISOString()
      })
    }
  })

  app.get("/", (req, res) => {
    res.status(200).send("Vinipim Portfolio API is running")
  })

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  app.get("/api/chat", async (req, res) => {
    const q = String(req.query.q || "")
    try {
      const resposta = await chain.invoke({ mensagem: q })
      res.json({ resposta: resposta.content })
    } catch (e) {
      console.error("Erro no LangChain:", e)
      res.status(500).json({ erro: "Falha no modelo local" })
    }
  })

  const env = process.env.NODE_ENV || "development"

  if (env === "development") {
    await setupVite(app, server)
  }

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

