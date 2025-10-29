#!/usr/bin/env node

// Railway Auto-Fix Assistant
// Detects and fixes common Railway deployment issues

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 RAILWAY AUTO-FIX ASSISTANT');
console.log('=============================');

let fixesApplied = 0;

// Fix 1: Ensure Railway CLI is installed
console.log('1️⃣  Checking Railway CLI...');
try {
  execSync('railway --version', { stdio: 'pipe' });
  console.log('✅ Railway CLI installed');
} catch (error) {
  console.log('❌ Railway CLI missing - Installing...');
  execSync('npm install -g @railway/cli', { stdio: 'inherit' });
  console.log('✅ Railway CLI installed');
  fixesApplied++;
}

// Fix 2: Check login status
console.log('2️⃣  Checking Railway login...');
try {
  execSync('railway whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Railway');
} catch (error) {
  console.log('❌ Not logged in - Please run: railway login');
  console.log('Then run this script again');
  process.exit(1);
}

// Fix 3: Check project linking
console.log('3️⃣  Checking project linking...');
try {
  const status = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
  if (status.includes('vinipimsite') || status.includes('linked')) {
    console.log('✅ Project linked');
  } else {
    throw new Error('Not linked');
  }
} catch (error) {
  console.log('❌ Project not linked - Linking now...');
  console.log('Select your vinipimsite project when prompted:');
  execSync('railway link', { stdio: 'inherit' });
  console.log('✅ Project linked');
  fixesApplied++;
}

// Fix 4: Validate and fix railway.toml
console.log('4️⃣  Validating railway.toml...');
const railwayTomlPath = join(rootDir, 'railway.toml');
let tomlContent = '';

if (existsSync(railwayTomlPath)) {
  tomlContent = readFileSync(railwayTomlPath, 'utf8');
} else {
  console.log('❌ railway.toml missing - Creating...');
  tomlContent = `[build]
builder = "NIXPACKS"
buildCommand = "pnpm install --frozen-lockfile && pnpm build"

[deploy]
startCommand = "node dist/server/index.cjs"
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[nixpacks]
providers = ["node"]
phases = { setup = "npm i -g corepack@latest && corepack enable && corepack prepare --activate", install = "pnpm install --frozen-lockfile", build = "pnpm build" }`;

  writeFileSync(railwayTomlPath, tomlContent);
  console.log('✅ railway.toml created');
  fixesApplied++;
}

// Validate railway.toml content
const requiredConfigs = [
  'startCommand = "node dist/server/index.cjs"',
  'healthcheckPath = "/health"',
  'builder = "NIXPACKS"'
];

let tomlValid = true;
for (const config of requiredConfigs) {
  if (!tomlContent.includes(config)) {
    console.log(`❌ Missing config: ${config}`);
    tomlValid = false;
  }
}

if (!tomlValid) {
  console.log('❌ railway.toml invalid - Recreating...');
  writeFileSync(railwayTomlPath, tomlContent);
  console.log('✅ railway.toml fixed');
  fixesApplied++;
} else {
  console.log('✅ railway.toml valid');
}

// Fix 5: Build locally to ensure it works
console.log('5️⃣  Testing local build...');
try {
  execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
  console.log('✅ Local build successful');
} catch (error) {
  console.log('❌ Local build failed - Fixing...');

  // Try common fixes
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

  if (!packageJson.scripts.build.includes('build-server.js')) {
    console.log('Fixing build script...');
    packageJson.scripts.build = "vite build --mode production && node scripts/copy-server.js && npx tsx scripts/build-server.js";
    writeFileSync(join(rootDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    console.log('✅ Build script fixed');
    fixesApplied++;
  }

  // Try build again
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    console.log('✅ Local build successful after fix');
  } catch (retryError) {
    console.log('❌ Build still failing - Check dependencies');
    process.exit(1);
  }
}

// Fix 6: Check environment variables
console.log('6️⃣  Checking Railway environment...');
try {
  const envOutput = execSync('railway variables', { encoding: 'utf8', stdio: 'pipe' });
  const hasMySQL = envOutput.includes('MYSQLHOST') && envOutput.includes('MYSQLUSER');

  if (!hasMySQL) {
    console.log('⚠️  MySQL variables may not be configured');
    console.log('Please check Railway dashboard and ensure MySQL variables are set:');
    console.log('- MYSQLHOST');
    console.log('- MYSQLPORT');
    console.log('- MYSQLUSER');
    console.log('- MYSQLPASSWORD');
    console.log('- MYSQLDATABASE');
  } else {
    console.log('✅ MySQL variables configured');
  }
} catch (error) {
  console.log('⚠️  Could not check Railway environment variables');
  console.log('Please verify MySQL variables in Railway dashboard');
}

// Final status
console.log('🎉 AUTO-FIX COMPLETE!');
console.log(`🔧 Fixes applied: ${fixesApplied}`);

if (fixesApplied > 0) {
  console.log('📝 Summary of fixes:');
  if (fixesApplied >= 1) console.log('  • Railway CLI installed');
  if (fixesApplied >= 2) console.log('  • Project linked');
  if (fixesApplied >= 3) console.log('  • railway.toml created/fixed');
  if (fixesApplied >= 4) console.log('  • Build script fixed');
}

console.log('');
console.log('🚀 Ready for deployment!');
console.log('Run: npm run deploy');
console.log('Or:  railway deploy');
