// scripts/build-server.js
import { build } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

await build({
  entryPoints: [join(rootDir, 'server', '_core', 'index.ts')],
  outfile: join(rootDir, 'dist', 'server', 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  sourcemap: false,
  minify: false,
  keepNames: true,
  logLevel: 'info',
});

console.log('OK: dist/server/index.js');
