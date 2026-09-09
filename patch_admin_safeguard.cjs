const fs = require('fs');
let content = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

// Safe map arrays
content = content.replace(/\{projects\.map/g, "{(projects || []).map");
content = content.replace(/\{payments\.map/g, "{(payments || []).map");
content = content.replace(/\{winners\.map/g, "{(winners || []).map");
content = content.replace(/\{bankAccounts\.map/g, "{(bankAccounts || []).map");
content = content.replace(/\{terms\.map/g, "{(terms || []).map");
content = content.replace(/t\.paragraphs\.map/g, "(t.paragraphs || []).map");

// Safe array methods
content = content.replace(/users\.find/g, "(users || []).find");
content = content.replace(/users\.filter/g, "(users || []).filter");
content = content.replace(/activeProjects\.filter/g, "(activeProjects || []).filter");
content = content.replace(/activeProjects\.some/g, "(activeProjects || []).some");
content = content.replace(/payments\.filter/g, "(payments || []).filter");
content = content.replace(/projects\.find/g, "(projects || []).find");

fs.writeFileSync('src/views/AdminView.tsx', content, 'utf8');
console.log('patched admin safeguards');
