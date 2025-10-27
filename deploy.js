#!/usr/bin/env node

// One-Click Railway Deploy
// Handles everything automatically

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 ONE-CLICK RAILWAY DEPLOY');
console.log('===========================');

// Step 1: Install Railway CLI if needed
console.log('📦 Step 1: Installing Railway CLI...');
try {
  execSync('railway --version', { stdio: 'pipe' });
  console.log('✅ Railway CLI already installed');
} catch (error) {
  console.log('Installing Railway CLI...');
  execSync('npm install -g @railway/cli', { stdio: 'inherit' });
  console.log('✅ Railway CLI installed');
}

// Step 2: Login check
console.log('🔑 Step 2: Checking Railway login...');
try {
  execSync('railway whoami', { stdio: 'pipe' });
  console.log('✅ Already logged in to Railway');
} catch (error) {
  console.log('❌ Not logged in to Railway');
  console.log('🔑 Please run: railway login');
  console.log('Then run this script again');
  process.exit(1);
}

// Step 3: Validate project
console.log('🔍 Step 3: Validating project...');
const validations = [
  () => existsSync(join(rootDir, 'railway.toml')) && 'railway.toml exists',
  () => {
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    return pkg.scripts.build && 'build script configured';
  },
  () => existsSync(join(rootDir, 'server/_core/index.ts')) && 'server code exists',
  () => existsSync(join(rootDir, 'dist/index.html')) && 'frontend built'
];

let allValid = true;
for (const validation of validations) {
  try {
    const result = validation();
    if (result) {
      console.log(`✅ ${result}`);
    } else {
      console.log(`❌ Validation failed`);
      allValid = false;
    }
  } catch (error) {
    console.log(`❌ Validation error: ${error.message}`);
    allValid = false;
  }
}

if (!allValid) {
  console.log('❌ Project validation failed');
  process.exit(1);
}

// Step 4: Link project if needed
console.log('🔗 Step 4: Linking project...');
try {
  const status = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
  if (status.includes('vinipimsite') || status.includes('linked')) {
    console.log('✅ Project already linked');
  } else {
    throw new Error('Not linked');
  }
} catch (error) {
  console.log('Project not linked. Linking now...');
  console.log('When prompted, select your "vinipimsite" project:');
  execSync('railway link', { stdio: 'inherit' });
  console.log('✅ Project linked');
}

// Step 5: Build and deploy
console.log('🏗️  Step 5: Building application...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
console.log('✅ Build complete');

console.log('🚀 Step 6: Deploying to Railway...');
execSync('railway deploy', { cwd: rootDir, stdio: 'inherit' });
console.log('✅ Deployment initiated');

// Step 6: Get status
console.log('📊 Step 7: Checking deployment status...');
setTimeout(() => {
  try {
    console.log('Current Railway status:');
    const status = execSync('railway status', { encoding: 'utf8', stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not get status (normal during deployment)');
  }

  console.log('');
  console.log('🎉 DEPLOYMENT PROCESS COMPLETE!');
  console.log('================================');
  console.log('🌐 Check your Railway dashboard for the live URL');
  console.log('💚 Health check will be available at: /health');
  console.log('📱 Frontend will be served automatically');
  console.log('');
  console.log('If deployment fails, check Railway dashboard logs for details.');
}, 3000);
