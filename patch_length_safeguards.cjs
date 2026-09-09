const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/{views,components}/**/*.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Safe length accesses for optional arrays
  const replacePairs = [
    [/payments\.length/g, "(payments || []).length"],
    [/activeProjects\.length/g, "(activeProjects || []).length"],
    [/projects\.length/g, "(projects || []).length"],
    [/users\.length/g, "(users || []).length"],
    [/winners\.length/g, "(winners || []).length"],
    [/bankAccounts\.length/g, "(bankAccounts || []).length"],
    [/terms\.length/g, "(terms || []).length"],
    [/\(\(payments \|\| \[\]\) \|\| \[\]\)/g, "(payments || [])"],
    [/\(\(activeProjects \|\| \[\]\) \|\| \[\]\)/g, "(activeProjects || [])"],
    [/\(\(projects \|\| \[\]\) \|\| \[\]\)/g, "(projects || [])"],
    [/\(\(users \|\| \[\]\) \|\| \[\]\)/g, "(users || [])"],
    [/\(\(winners \|\| \[\]\) \|\| \[\]\)/g, "(winners || [])"],
    [/\(\(bankAccounts \|\| \[\]\) \|\| \[\]\)/g, "(bankAccounts || [])"],
    [/\(\(terms \|\| \[\]\) \|\| \[\]\)/g, "(terms || [])"]
  ];

  let original = content;
  replacePairs.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });
  
  if (original !== content) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('patched length safeguards in ' + f);
  }
});
