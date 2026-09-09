const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/{views,components}/**/*.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Safe map/filter arrays in components that accept these as props
  const replacePairs = [
    [/payments\.filter/g, "(payments || []).filter"],
    [/payments\.map/g, "(payments || []).map"],
    [/activeProjects\.map/g, "(activeProjects || []).map"],
    [/activeProjects\.filter/g, "(activeProjects || []).filter"],
    [/activeProjects\.some/g, "(activeProjects || []).some"],
    [/projects\.map/g, "(projects || []).map"],
    [/projects\.filter/g, "(projects || []).filter"],
    [/projects\.find/g, "(projects || []).find"],
    [/users\.filter/g, "(users || []).filter"],
    [/users\.map/g, "(users || []).map"],
    [/users\.find/g, "(users || []).find"],
    [/winners\.map/g, "(winners || []).map"],
    [/winners\.some/g, "(winners || []).some"],
    [/bankAccounts\.map/g, "(bankAccounts || []).map"],
    [/bankAccounts\.filter/g, "(bankAccounts || []).filter"],
    [/terms\.map/g, "(terms || []).map"],
    [/t\.paragraphs\.map/g, "(t.paragraphs || []).map"],
    // avoid double replacements
    [/\(\(payments \|\| \[\]\) \|\| \[\]\)/g, "(payments || [])"],
    [/\(\(activeProjects \|\| \[\]\) \|\| \[\]\)/g, "(activeProjects || [])"],
    [/\(\(projects \|\| \[\]\) \|\| \[\]\)/g, "(projects || [])"],
    [/\(\(users \|\| \[\]\) \|\| \[\]\)/g, "(users || [])"],
    [/\(\(winners \|\| \[\]\) \|\| \[\]\)/g, "(winners || [])"],
    [/\(\(bankAccounts \|\| \[\]\) \|\| \[\]\)/g, "(bankAccounts || [])"],
    [/\(\(terms \|\| \[\]\) \|\| \[\]\)/g, "(terms || [])"],
    [/\(\(t\.paragraphs \|\| \[\]\) \|\| \[\]\)/g, "(t.paragraphs || [])"]
  ];

  let original = content;
  replacePairs.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });
  
  if (original !== content) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('patched safeguards in ' + f);
  }
});
