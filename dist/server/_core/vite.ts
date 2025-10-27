import express from "express";
import fs from "fs";

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
  if (!distPath || !fs.existsSync(distPath)) return;
  if (!distPath) {
    console.error("❌ serveStatic: distPath está undefined!");
    return;
  }
  if (!distPath.trim()) {
    console.error("❌ serveStatic: distPath está vazio!");
    return;
  }
  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️ Pasta não existe: ${distPath}`);
    return;
  }
  console.log(`✅ Servindo arquivos estáticos de: ${distPath}`);
  app.use(express.static(distPath));
}
