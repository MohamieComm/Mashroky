const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'repo-scan-report.json');
const IGNORE = ['node_modules', '.git', 'build', 'dist', 'public/docx_tmp_ex3', 'public/docx_tmp_ex4', 'public/docx_tmp_ex5'];
const TEXT_EXT = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.txt'];

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORE.some(ig => e.name === ig)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, fileList);
    else fileList.push(full);
  }
  return fileList;
}

function analyzeFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!TEXT_EXT.includes(ext)) return null;
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (e) {
    return null;
  }
  const lines = raw.split(/\r?\n/);
  const mojibake = [];
  const imgIssues = [];
  const logoRefs = [];
  const usesImageWithFallback = /ImageWithFallback/.test(raw);

  lines.forEach((ln, i) => {
    if (ln.includes('\uFFFD') || ln.includes('�')) mojibake.push({ line: i + 1, text: ln.trim().slice(0, 300) });
    if (/\<img\s/i.test(ln)) {
      const hasAlt = /alt\s*=/.test(ln);
      if (!hasAlt) imgIssues.push({ line: i + 1, text: ln.trim().slice(0, 300), reason: 'missing-alt' });
      // record if file uses raw <img> and not ImageWithFallback
    }
    if (/logo\.png/i.test(ln)) logoRefs.push({ line: i + 1, text: ln.trim().slice(0, 300) });
  });

  const usesRawImg = /<img\s/i.test(raw);
  const missingFallback = usesRawImg && !usesImageWithFallback;

  if (mojibake.length || imgIssues.length || logoRefs.length || missingFallback) {
    return {
      file: path.relative(ROOT, file),
      mojibake,
      imgIssues,
      logoRefs,
      usesImageWithFallback: !!usesImageWithFallback,
      usesRawImg: !!usesRawImg,
      missingFallback,
    };
  }
  return null;
}

function main() {
  const all = walk(ROOT);
  const results = [];
  for (const f of all) {
    const r = analyzeFile(f);
    if (r) results.push(r);
  }
  const out = { generatedAt: new Date().toISOString(), results, summary: { filesChecked: all.length, filesWithFindings: results.length } };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('Report written to', OUT);
}

main();
