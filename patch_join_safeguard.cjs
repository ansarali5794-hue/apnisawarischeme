const fs = require('fs');
let content = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

content = content.replace(
  /paragraphsText: t\.paragraphs\.join/g,
  "paragraphsText: (t.paragraphs || []).join"
);

fs.writeFileSync('src/views/AdminView.tsx', content, 'utf8');
console.log('patched join');
