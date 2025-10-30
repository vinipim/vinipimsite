#!/usr/bin/env node
import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const tasks = [
  {
    title: "📦 Installing dependencies",
    command: "pnpm",
    args: ["install"],
  },
  {
    title: "🏗️ Building project",
    command: "pnpm",
    args: ["build"],
  },
  {
    title: "✅ Running deploy verification",
    command: "pnpm",
    args: ["verify-deploy"],
  },
];

async function runTask({ title, command, args }) {
  console.log(`\n${title}`);
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
    child.on("error", reject);
  });
}

(async () => {
  console.log("🔁 Post-pull health check starting...");
  try {
    for (const task of tasks) {
      await runTask(task);
    }
    console.log("\n🎉 All post-pull checks finished successfully!\n");
  } catch (error) {
    console.error(`\n❌ Post-pull check failed: ${error.message}`);
    process.exit(1);
  }
})();
