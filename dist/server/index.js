// src/server/index.ts
import express from "express";
import { createServer } from "http";
var app = express();
var server = createServer(app);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/", (req, res) => {
  res.status(200).send("Vinipim Portfolio API is running");
});
var port = process.env.PORT || 3e3;
server.listen(port, "0.0.0.0", () => {
  console.log(`\u2705 Server running on port ${port}`);
  console.log(`\u{1F680} Health check: http://localhost:${port}/health`);
});
