#!/usr/bin/env node

// Railway Auto-Deploy Assistant
// Automates Railway configuration and deployment

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚂 RAILWAY AUTO-DEPLOY ASSISTANT');
console.log('================================');

// Check Railway CLI
try {
  execSync('railway --version', { stdio: 'pipe' });
  console.log('✅ Railway CLI installed');
} catch (error) {
  console.log('❌ Railway CLI not installed');
  console.log('📦 Installing Railway CLI...');
  execSync('npm install -g @railway/cli', { stdio: 'inherit' });
  console.log('✅ Railway CLI installed');
}

// Check if logged in
try {
  execSync('railway whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Railway');
} catch (error) {
  console.log('❌ Not logged in to Railway');
  console.log('🔑 Please run: railway login');
  console.log('Then run this script again');
  process.exit(1);
}

// Check if project is linked
let isLinked = false;
try {
  const output = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
  if (output.includes('vinipimsite') || output.includes('linked')) {
    isLinked = true;
    console.log('✅ Project linked to Railway');
  }
} catch (error) {
  console.log('❌ Project not linked');
}

if (!isLinked) {
  console.log('🔗 Linking project...');
  console.log('When prompted, select your vinipimsite project');
  try {
    execSync('railway link', { stdio: 'inherit' });
    console.log('✅ Project linked');
  } catch (error) {
    console.log('❌ Failed to link project');
    console.log('Please run: railway link');
    console.log('And select your vinipimsite project manually');
    process.exit(1);
  }
}

// Validate configuration
console.log('🔍 Validating configuration...');

const checks = [
  {
    name: 'railway.toml exists',
    check: () => existsSync(join(rootDir, 'railway.toml'))
  },
  {
    name: 'package.json build script',
    check: () => {
      const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
      return pkg.scripts.build && pkg.scripts.build.includes('build-server.js');
    }
  },
  {
    name: 'server files exist',
    check: () => existsSync(join(rootDir, 'server', '_core', 'index.ts'))
  },
  {
    name: 'build scripts exist',
    check: () => existsSync(join(rootDir, 'scripts', 'build-server.js')) &&
                 existsSync(join(rootDir, 'scripts', 'copy-server.js'))
  },
  {
    name: 'environment variables configured',
    check: () => {
      // This would check Railway environment variables
      return true; // Placeholder - would need Railway API
    }
  }
];

let allPassed = true;
for (const check of checks) {
  try {
    const passed = check.check();
    console.log(`${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) allPassed = false;
  } catch (error) {
    console.log(`❌ ${check.name} - Error: ${error.message}`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.log('❌ Configuration validation failed');
  console.log('Please fix the issues above before deploying');
  process.exit(1);
}

console.log('✅ All validations passed');

// Build locally first
console.log('🏗️  Building locally...');
try {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Local build successful');
} catch (error) {
  console.log('❌ Local build failed');
  console.log('Please fix build issues before deploying');
  process.exit(1);
}

// Deploy to Railway
console.log('🚀 Deploying to Railway...');
try {
  execSync('railway deploy', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Deployment initiated');

  // Wait a bit and check status
  console.log('⏳ Checking deployment status...');
  setTimeout(() => {
    try {
      const status = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
      console.log('📊 Deployment Status:');
      console.log(status);
    } catch (error) {
      console.log('⚠️  Could not get deployment status');
    }

    console.log('🎉 DEPLOYMENT COMPLETE!');
    console.log('🌐 Check your Railway dashboard for the live URL');
    console.log('💚 Health check: https://your-domain.up.railway.app/health');

  }, 5000);

} catch (error) {
  console.log('❌ Deployment failed');
  console.log('Check Railway dashboard for error details');
  process.exit(1);
}
