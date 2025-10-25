import express from "express";
import { createServer } from "http";
import path from "node:path";
console.log("\u{1F680} Starting Vinipim Portfolio Server...");
const app = express();
const server = createServer(app);
console.log("\u{1F4C1} Serving static files from:", path.join(process.cwd(), "dist"));
app.use(express.static(path.join(process.cwd(), "dist")));
console.log("\u{1F3E5} Setting up health check...");
app.get("/health", (req, res) => {
  console.log("\u{1F49A} Health check requested");
  res.status(200).json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
console.log("\u{1F3E0} Setting up root route...");
app.get("/", (req, res) => {
  console.log("\u{1F3E0} Root route requested");
  res.status(200).send("Vinipim Portfolio API is running");
});
console.log("\u{1F504} Setting up SPA fallback...");
app.use((req, res, next) => {
  console.log(`\u{1F310} Request: ${req.method} ${req.path}`);
  if (req.method === "GET") {
    const filePath = path.join(process.cwd(), "dist", "index.html");
    console.log("\u{1F4C4} Serving index.html from:", filePath);
    res.sendFile(filePath);
  } else {
    next();
  }
});
console.log("\u{1F527} Starting server...");
const port = process.env.PORT || 3e3;
console.log("\u{1F3AF} Port:", port);
server.listen(port, "0.0.0.0", () => {
  console.log(`\u2705 Server running on port ${port}`);
  console.log(`\u{1F680} Health check: http://localhost:${port}/health`);
});
