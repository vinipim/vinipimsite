import express from "express";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";
import { serveStatic } from "./_core/vite";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

registerOAuthRoutes(app);

const distPath = path.join(__dirname, "..", "..");
serveStatic(app, distPath);

app.get("/health", (_req, res) => {
  res.set("Content-Type", "application/json");
  res.status(200).json({ status: "ok" });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, "0.0.0.0", () => {
  console.log("Server ready", { port });
});
