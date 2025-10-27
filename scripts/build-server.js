import { cpSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function copyAndCompileServer() {
  try {
    // Create dist/server directory
    const distServerDir = join(rootDir, 'dist', 'server');
    mkdirSync(distServerDir, { recursive: true });

    // Copy all server files
    const serverDir = join(rootDir, 'server');
    cpSync(serverDir, distServerDir, { recursive: true });

    console.log('✅ Server files copied to dist/server/');

    // Compile TypeScript files to JavaScript
    const tsFiles = [];

    function findTsFiles(dir) {
      const files = readdirSync(dir);
      for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
          findTsFiles(filePath);
        } else if (extname(file) === '.ts') {
          tsFiles.push(filePath);
        }
      }
    }

    findTsFiles(distServerDir);

    if (tsFiles.length > 0) {
      console.log(`🔨 Compiling ${tsFiles.length} TypeScript files...`);

      await build({
        entryPoints: tsFiles,
        outdir: distServerDir,
        format: 'esm',
        platform: 'node',
        target: 'node18',
        sourcemap: false,
        minify: false,
        keepNames: true,
        outExtension: { '.js': '.js' },
        allowOverwrite: true,
      });

    // Create main index.js that imports from _core
    const mainIndexPath = join(distServerDir, 'index.js');
    const mainIndexContent = `// Main entry point for Railway deployment\nimport './_core/index.js';\n`;
    writeFileSync(mainIndexPath, mainIndexContent);

    console.log('✅ Main index.js created');

copyAndCompileServer();
