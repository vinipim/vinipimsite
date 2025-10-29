#!/usr/bin/env node

import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptUrl = pathToFileURL(join(__dirname, "scripts", "railway-deploy.js"));

await import(scriptUrl.href);
