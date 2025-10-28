import express from "express"
import { createServer } from "http"
import path from "path"
import fs from "fs"

const __dirname = path.join(process.cwd(), 'server', '_core')
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

  // Health check - Railway requirement
  app.get("/health", (req, res) => {
    console.log('Health responding')
    res.status(200).send('ok')
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
  const port = parseInt(process.env.PORT || "3000", 10)
  console.log(`🎯 PORT env: ${process.env.PORT}, using port: ${port}`)

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
