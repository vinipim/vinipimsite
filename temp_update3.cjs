const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.type = p.type || 'module';
p.scripts = Object.assign({}, p.scripts, {
  build: "vite build && node scripts/build-server.js",
  start: "node dist/server/index.js",
  check: "tsc --noEmit",
  prebuild: "pnpm approve-builds esbuild || true"
});
p.engines = Object.assign({}, p.engines, { node: ">=22.12.0" });
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
