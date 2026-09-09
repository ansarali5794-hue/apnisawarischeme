const fs = require('fs');
let content = fs.readFileSync('src/components/AdminApprovalsSection.tsx', 'utf8');

content = content.replace(/users\.filter/g, "(users || []).filter");
content = content.replace(/activeProjects\.filter/g, "(activeProjects || []).filter");
content = content.replace(/projects\.find/g, "(projects || []).find");

fs.writeFileSync('src/components/AdminApprovalsSection.tsx', content, 'utf8');
console.log('patched approvals safeguards');
