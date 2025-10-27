import { cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

  console.log('✅ Server files copied to dist/server/');
} catch (error) {
  console.error('❌ Error copying server files:', error);
  process.exit(1);
}
