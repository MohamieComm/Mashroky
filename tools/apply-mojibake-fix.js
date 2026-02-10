const fs = require('fs');
const path = require('path');
const reportPath = path.join(__dirname, 'mojibake-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('Report not found:', reportPath);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const repoRoot = path.resolve(__dirname, '..');
let patched = 0;
for (const r of report.results) {
  const rel = r.file.replace(/\\/g, path.sep);
  const filePath = path.join(repoRoot, rel);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('�')) {
    fs.copyFileSync(filePath, filePath + '.bak');
    const newContent = content.split('�').join('');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Patched', rel);
    patched++;
  }
}
console.log(`Done. Patched ${patched} files.`);
