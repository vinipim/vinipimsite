#!/usr/bin/env node

// Railway pre-deploy script
// Ensures the application is ready for deployment

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Railway Pre-Deploy Script Started');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'railway.toml',
  'server/_core/index.ts',
  'scripts/copy-server.js',
  'scripts/build-server.js'
];

for (const file of requiredFiles) {
  try {
    readFileSync(join(rootDir, file));
    console.log(`✅ ${file} exists`);
  } catch (error) {
    console.error(`❌ ${file} missing`);
    process.exit(1);
  }
}

// Verify package.json has correct scripts
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
if (!packageJson.scripts.build.includes('build-server.js')) {
  console.error('❌ Build script not configured correctly');
  process.exit(1);
}

// Verify railway.toml configuration
const railwayToml = readFileSync(join(rootDir, 'railway.toml'), 'utf8');
if (!railwayToml.includes('startCommand = "node dist/server/index.cjs"')) {
  console.error('❌ Railway start command not configured');
  process.exit(1);
}

console.log('✅ All pre-deploy checks passed');
console.log('🎉 Ready for Railway deployment!');
