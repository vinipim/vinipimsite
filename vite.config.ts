import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

<<<<<<< HEAD
const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
];
=======
// plugins de build
const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()]
>>>>>>> 7fd43ae83b63db3cb28e177a5f07135d563dea81

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // variáveis de ambiente
  envDir: path.resolve(import.meta.dirname),

  // raiz do projeto cliente
  root: path.resolve(import.meta.dirname, "client"),

  // assets públicos
  publicDir: path.resolve(import.meta.dirname, "client", "public"),

  // saída do build
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },

  // servidor dev (não usado no Railway, mas útil localmente)
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
