const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts.start = 'node dist/server/index.cjs';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
