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
// LangChain + Ollama (TEMPORARIAMENTE DESABILITADO)
// ----------------------
// import { ChatOllama } from "@langchain/community/chat_models/ollama"
// import { ChatPromptTemplate } from "langchain/prompts"
// import { RunnableSequence } from "langchain/runnables"

// const model = new ChatOllama({ model: "gemma3:1b" })
// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", "Você é um assistente direto e claro."],
//   ["human", "{mensagem}"]
// ])
// const chain = RunnableSequence.from([prompt, model])

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

  // Middlewares básicos com error handling
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

  // Health check - SEMPRE retorna 200, ANTES de qualquer outro middleware
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  registerOAuthRoutes(app)

  // Root endpoint - protegido contra falhas
  app.get("/", (req, res) => {
    try {
      res.status(200).send("Vinipim Portfolio API is running");
    } catch (error) {
      console.error("Root endpoint error:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Middleware tRPC com proteção contra falhas
  app.use("/api/trpc", (req, res, next) => {
    try {
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })(req, res, next);
    } catch (error) {
      console.error("tRPC middleware error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Endpoint /api/chat TEMPORARIAMENTE DESABILITADO (problemas com LangChain)
  // app.get("/api/chat", async (req, res) => {
  //   try {
  //     const q = String(req.query.q || "")
  //     const resposta = await chain.invoke({ mensagem: q })
  //     res.json({ resposta: resposta.content })
  //   } catch (error) {
  //     console.error("Erro no LangChain:", error)
  //     if (!res.headersSent) {
  //       res.status(500).json({ erro: "Falha no modelo local" })
  //     }
  //   }
  // })

  const env = process.env.NODE_ENV || "development"

  // Proteção contra falhas no setupVite
  if (env === "development") {
    try {
      await setupVite(app, server)
      console.log("✅ Vite development server setup complete")
    } catch (error) {
      console.error("❌ Vite setup failed:", error)
      // Continua sem Vite se falhar
    }
  }

  // Resolução de porta com proteção contra falhas
  let finalPort: number
  try {
    const port = parseInt(process.env.PORT || "3000", 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${process.env.PORT}`)
    }
    finalPort = env === "production" ? port : await findAvailablePort(port)
  } catch (error) {
    console.error("Port resolution failed:", error)
    finalPort = 3000 // Fallback
  }

  console.log('🚀 Server starting on port:', finalPort)
  console.log('🏥 Health endpoint ready at /health')
  console.log('🏠 Root endpoint ready at /')

  server.listen(finalPort, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${finalPort}`)
    console.log(`🌍 Environment: ${env}`)
    console.log(`💾 Database: ${process.env.DATABASE_URL ? "Configured" : "Not configured"}`)
    console.log(`🔗 Health check: http://localhost:${finalPort}/health`)
  })

  // Middleware catch-all para proteger contra falhas não tratadas
  app.use((error: any, req: any, res: any, next: any) => {
    console.error(`❌ Unhandled error in ${req.method} ${req.path}:`, error)
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        path: req.path,
        method: req.method
      })
    }
  })

  // Middleware 404 para requests não encontrados
  app.use((req, res) => {
    console.warn(`⚠️ Route not found: ${req.method} ${req.path}`)
    if (!res.headersSent) {
      res.status(404).json({
        error: "Not found",
        path: req.path,
        method: req.method
      })
    }
  })

  // Tratamento de erros não capturados
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  })
}

startServer().catch(console.error)
