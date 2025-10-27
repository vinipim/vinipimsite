import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  // Compile the main index.ts to index.js using tsx
  const coreIndexTs = join(rootDir, 'dist', 'server', '_core', 'index.ts');
  const coreIndexJs = join(rootDir, 'dist', 'server', '_core', 'index.js');

  console.log('🔨 Compiling server with tsx...');
  execSync(`npx tsx --output ${coreIndexJs} ${coreIndexTs}`, { stdio: 'inherit' });

  // Create main index.js that imports from _core
  const mainIndexPath = join(rootDir, 'dist', 'server', 'index.js');
  const mainIndexContent = `// Main entry point for Railway deployment
import './_core/index.js';
`;
  writeFileSync(mainIndexPath, mainIndexContent);

  console.log('✅ Server compilation complete');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
