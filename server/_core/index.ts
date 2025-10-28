import "dotenv/config"
import express from "express"
import { createServer } from "http"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../../dist')
const isProduction = process.env.NODE_ENV === "production"
const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined

console.log('🚀 Starting Vinipim Portfolio Server')
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🚂 Platform: ${isRailway ? 'Railway' : 'Local'}`)
console.log(`📁 Static files path: ${distPath}`)
console.log(`📁 Static files exist: ${fs.existsSync(distPath)}`)

async function startServer() {
  const app = express()
  const server = createServer(app)

  // Railway production optimizations
  if (isProduction) {
    app.set('trust proxy', 1)
  }

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    if (isRailway) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    next()
  })

  // Body parsing
  app.use(express.json({ limit: "50mb" }))
  app.use(express.urlencoded({ limit: "50mb", extended: true }))

  // Health check - Railway requirement
  app.get("/health", (req, res) => {
    console.log(`💚 Health check from ${req.ip} at ${new Date().toISOString()}`)
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      platform: isRailway ? "railway" : "local",
      database: process.env.MYSQLHOST ? "configured" : "not configured"
    })
  })

  // Root route for testing
  app.get("/", (req, res) => {
    res.json({ message: "Vinipim Portfolio Server", status: "running", timestamp: new Date().toISOString() })
  })

  // API routes placeholder
  // app.use("/api/trpc", createExpressMiddleware({
  //   router: appRouter,
  //   createContext,
  // }))

  // Static file serving with SPA fallback
  // if (fs.existsSync(distPath)) {
  //   app.use(express.static(distPath, {
  //     maxAge: isProduction ? '1y' : 0,
  //     etag: true
  //   }))

  //   // SPA fallback for client-side routing
  //   app.get('*', (req, res, next) => {
  //     if (req.path.startsWith('/api/')) {
  //       return next()
  //     }

  //     const indexPath = path.join(distPath, 'index.html')
  //     if (fs.existsSync(indexPath)) {
  //       res.sendFile(indexPath)
  //     } else {
  //       res.status(404).send('Application not built yet')
  //     }
  //   })
  // } else {
  //   console.warn('⚠️  Static files not found - only API routes available')
  //   app.get('/', (req, res) => {
  //     res.json({
  //       message: 'Vinipim Portfolio API',
  //       status: 'running',
  //       environment: process.env.NODE_ENV || 'development',
  //       timestamp: new Date().toISOString()
  //     })
  //   })
  // }

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(`❌ Error in ${req.method} ${req.path}:`, err.message)
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        ...(isProduction ? {} : { details: err.message })
      })
    }
  })

  // 404 handler
  app.use((req, res) => {
    if (!res.headersSent) {
      res.status(404).json({
        error: 'Not found',
        path: req.path,
        method: req.method
      })
    }
  })

  // Get port (Railway provides PORT env var)
  const port = parseInt(process.env.PORT || "8080", 10)
  console.log(`🎯 Starting server on port ${port}`)

  // Start server
  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running successfully`)
    console.log(`🔗 Local: http://localhost:${port}`)
    console.log(`💚 Health: http://localhost:${port}/health`)
    if (fs.existsSync(distPath)) {
      console.log(`🌐 Frontend: http://localhost:${port}`)
    }
    console.log(`🚀 Ready for requests!`)
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })

  // Error handling
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason)
    process.exit(1)
  })
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})
