import "dotenv/config";
import express from "express";
import { createServer } from "http";

const app = express();
app.get("/health", (_req, res) => res.status(200).json({ ok: true, port: process.env.PORT || "8080" }));

// optional root for quick test
app.get("/", (_req, res) => res.status(200).send("OK"));

const port = parseInt(process.env.PORT || "8080", 10);
createServer(app).listen(port, "0.0.0.0", () => {
  console.log("PORT ENV:", process.env.PORT);
  console.log(`Server listening on ${port}`);
});
