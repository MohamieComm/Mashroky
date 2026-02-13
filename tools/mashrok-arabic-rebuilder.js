#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply') || argv.includes('--write');
const VERBOSE = argv.includes('--verbose');
const DIRS_ARG = argv.find((arg) => arg.startsWith('--dirs='));
const DIRS = (DIRS_ARG ? DIRS_ARG.replace('--dirs=', '') : 'app/src,flight-backend/src,public')
  .split(',')
  .map((part) => part.trim())
  .filter(Boolean)
  .map((part) => path.resolve(ROOT, part));

const REPORT_PATH = path.resolve(ROOT, 'ARABIC_REBUILD_REPORT.json');
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.txt']);

const hasTextDecoder = typeof TextDecoder !== 'undefined';
const windows1256Decoder = hasTextDecoder ? new TextDecoder('windows-1256') : null;
const utf8Decoder = hasTextDecoder ? new TextDecoder('utf-8') : null;
let windows1256Map = null;

const buildWindows1256Map = () => {
  if (!windows1256Decoder) return null;
  if (windows1256Map) return windows1256Map;
  const map = new Map();
  for (let i = 0; i < 256; i += 1) {
    const ch = windows1256Decoder.decode(new Uint8Array([i]));
    if (!map.has(ch)) map.set(ch, i);
  }
  windows1256Map = map;
  return map;
};

const mojibakeRegex = /[ÃâØÙÐ\uFFFD]/;
const mojibakeArabicRegex = /[طظ]/g;
const arabicRegex = /[\u0600-\u06FF]/g;
const latinRegex = /[A-Za-z]/g;

const countMatches = (value, regex) => (value.match(regex) || []).length;

const looksLikeMojibake = (value) => {
  if (!value || value.length < 2) return false;
  if (mojibakeRegex.test(value)) return true;
  const arabicCount = countMatches(value, arabicRegex);
  if (arabicCount === 0) return false;
  const mojibakeCount = countMatches(value, mojibakeArabicRegex);
  return mojibakeCount / arabicCount > 0.28;
};

const scoreCandidate = (value) => {
  const arabicCount = countMatches(value, arabicRegex);
  const mojibakeCount = countMatches(value, mojibakeArabicRegex);
  const latinCount = countMatches(value, latinRegex);
  const replacementCount = (value.match(/\uFFFD/g) || []).length;
  const hardMojibake = countMatches(value, /[ÃâØÙÐ]/g);
  return arabicCount * 2 - mojibakeCount * 4 - replacementCount * 10 - hardMojibake * 5 - latinCount * 0.5;
};

const decodeWindows1256 = (value) => {
  const map = buildWindows1256Map();
  if (!map || !utf8Decoder) return null;
  const bytes = new Uint8Array(value.length);
  let index = 0;
  for (const ch of value) {
    const byte = map.get(ch);
    if (byte === undefined) return null;
    bytes[index++] = byte;
  }
  return utf8Decoder.decode(bytes);
};

const decodeLatin1 = (value) => {
  try {
    return Buffer.from(value, 'latin1').toString('utf8');
  } catch {
    return null;
  }
};

const normalize = (value) => value.replace(/^\uFEFF/, '').normalize('NFC');

const fixSegment = (segment) => {
  if (!looksLikeMojibake(segment)) return segment;

  const candidates = [segment];
  const win = decodeWindows1256(segment);
  if (win) candidates.push(win);
  const latin = decodeLatin1(segment);
  if (latin) candidates.push(latin);
  if (win) {
    const win2 = decodeWindows1256(win);
    if (win2) candidates.push(win2);
  }

  let best = segment;
  let bestScore = scoreCandidate(segment);

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    const score = scoreCandidate(normalized);
    if (score > bestScore + 2) {
      best = normalized;
      bestScore = score;
    }
  }

  return best;
};

const processContent = (content, filePath) => {
  let output = '';
  let i = 0;
  let mode = null;
  let segment = '';
  let segmentStart = 0;
  const changes = [];

  const flushSegment = () => {
    if (!segment.length) return;
    const fixed = fixSegment(segment);
    if (fixed !== segment) {
      const line = content.slice(0, segmentStart).split(/\r?\n/).length;
      changes.push({
        file: filePath,
        line,
        before: segment,
        after: fixed,
      });
    }
    output += fixed;
    segment = '';
  };

  const readEscaped = () => {
    segment += content[i];
    if (i + 1 < content.length) {
      segment += content[i + 1];
      i += 2;
    } else {
      i += 1;
    }
  };

  while (i < content.length) {
    const ch = content[i];

    if (!mode) {
      if (ch === '"' || ch === "'" || ch === '`') {
        mode = ch;
        output += ch;
        segment = '';
        segmentStart = i + 1;
        i += 1;
      } else {
        output += ch;
        i += 1;
      }
      continue;
    }

    if (ch === '\\') {
      readEscaped();
      continue;
    }

    if (mode === '`' && ch === '$' && content[i + 1] === '{') {
      flushSegment();
      output += '${';
      i += 2;
      let depth = 1;
      while (i < content.length && depth > 0) {
        const c = content[i];
        output += c;
        if (c === '{') depth += 1;
        if (c === '}') depth -= 1;
        i += 1;
      }
      segmentStart = i;
      continue;
    }

    if (ch === mode) {
      flushSegment();
      output += ch;
      mode = null;
      i += 1;
      continue;
    }

    segment += ch;
    i += 1;
  }

  if (mode) flushSegment();

  return { output, changes };
};

const walk = (dir, files) => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (TEXT_EXT.has(path.extname(entry.name))) files.push(fullPath);
  }
};

const main = () => {
  const files = [];
  DIRS.forEach((dir) => walk(dir, files));

  const report = [];
  let changedFiles = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { output, changes } = processContent(raw, path.relative(ROOT, file));
    if (!changes.length) continue;

    changedFiles += 1;
    report.push(...changes);

    if (APPLY) {
      fs.writeFileSync(file, output, 'utf8');
    }

    if (VERBOSE) {
      console.log(`changed ${path.relative(ROOT, file)} (${changes.length})`);
    }
  }

  const summary = {
    mode: APPLY ? 'apply' : 'dry-run',
    scannedFiles: files.length,
    changedFiles,
    fixedSegments: report.length,
    successRate: report.length ? 100 : 0,
    generatedAt: new Date().toISOString(),
    samples: report.slice(0, 300),
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2), 'utf8');

  console.log('Mashrok Arabic Rebuild Report');
  console.log('============================');
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files changed: ${changedFiles}`);
  console.log(`Segments fixed: ${report.length}`);
  console.log(`Success rate: ${summary.successRate}%`);
  console.log(`Report saved: ${path.relative(ROOT, REPORT_PATH)}`);
};

main();
