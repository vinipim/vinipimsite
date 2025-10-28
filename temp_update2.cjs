const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.type = p.type || 'module';
p.dependencies = p.dependencies || {};
p.devDependencies = p.devDependencies || {};
p.scripts = Object.assign({}, p.scripts, {
  build: "vite build && node scripts/build-server.js",
  start: "node dist/server/index.js",
  check: "tsc --noEmit"
});
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
