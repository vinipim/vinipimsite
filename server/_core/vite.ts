import express from "express";

export async function setupVite(app: express.Application) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
  return vite;
}

export function serveStatic(app: express.Application, distPath: string) {
  app.use(express.static(distPath));
}
