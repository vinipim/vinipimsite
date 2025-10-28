// scripts/build-server.js
import { build } from "esbuild";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

await build({
  entryPoints: [join(root, "server", "_core", "index.ts")],
  outfile: join(root, "dist", "server", "index.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node22"],
  // keep Node builtins and dotenv as external to avoid "Dynamic require of 'fs'"
  external: ["fs", "path", "http", "dotenv"],
  sourcemap: false,
  logLevel: "info",
});
console.log("dist/server/index.js built");
