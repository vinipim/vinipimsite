import { execSync } from "child_process";

execSync("tsc -p tsconfig.server.json", { stdio: "inherit" });
console.log("compiled dist/server/index.js");
