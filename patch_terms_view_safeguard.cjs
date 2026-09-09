const fs = require('fs');
let content = fs.readFileSync('src/views/TermsView.tsx', 'utf8');

content = content.replace(
  /\{section\.paragraphs\.map/g,
  "{(section.paragraphs || []).map"
);
content = content.replace(
  /\{activeTerms\.map/g,
  "{(activeTerms || []).map"
);

fs.writeFileSync('src/views/TermsView.tsx', content, 'utf8');
console.log('patched terms view');
