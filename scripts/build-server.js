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
  format: "cjs",
  target: ["node22"],
  external: ["express"],
  logLevel: "info",
});
console.log("built dist/server/index.js");
