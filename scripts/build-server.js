import { cpSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  // Create dist/server directory
  const distServerDir = join(rootDir, 'dist', 'server');
  mkdirSync(distServerDir, { recursive: true });

  // Copy all server files
  const serverDir = join(rootDir, 'server');
  cpSync(serverDir, distServerDir, { recursive: true });

  // Compile the main index.ts to index.js
  const coreIndexTs = join(distServerDir, '_core', 'index.ts');
  const coreIndexJs = join(distServerDir, '_core', 'index.js');

  await build({
    entryPoints: [coreIndexTs],
    outfile: coreIndexJs,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: false,
    keepNames: true,
  });

  // Create main index.js that imports from _core
  const mainIndexPath = join(distServerDir, 'index.js');
  const mainIndexContent = `// Main entry point for Railway deployment
import './_core/index.js';
`;
  writeFileSync(mainIndexPath, mainIndexContent);

  console.log('✅ Server files copied, compiled, and entry point created');
} catch (error) {
  console.error('❌ Error in build process:', error);
  process.exit(1);
}
