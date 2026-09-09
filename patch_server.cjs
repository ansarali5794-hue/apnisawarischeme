const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  'const vite = await createViteServer({',
  'const { createServer: createViteServer } = await import("vite");\n    const vite = await createViteServer({'
);
fs.writeFileSync('server.ts', content, 'utf8');
console.log('Patched server.ts');
