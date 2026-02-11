#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAPPING_PATH = path.join(ROOT, 'tools', 'mojibake-mapping.json');

const TARGET_FILES = [
  'app/src/data/content.ts',
  'app/src/data/adminStore.ts',
  'app/src/pages/Admin.tsx',
  'app/src/pages/Offers.tsx',
  'app/src/pages/Study.tsx',
  'app/src/pages/Destinations.tsx',
  'app/src/pages/TripDetails.tsx',
];

const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.txt']);

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply') || argv.includes('--write');
const SCAN_ALL = argv.includes('--scan') || argv.includes('--all');
const INCLUDE_TOOLS = argv.includes('--include-tools');

const mojibakeRegex = /[\uFFFD]|ï¿½|Ã|Â|â€“|â€”|â€|â€™|â€œ|â€�/;
const questionRegex = /\?{3,}/;

const commonPhraseMap = new Map([
  ['????? ????? ?????', 'الاسم الأول مطلوب'],
  ['??? ??????? ?????', 'اسم العائلة مطلوب'],
  ['????? ??????? ?????', 'تاريخ الميلاد مطلوب'],
  ['????? ?????', 'الجنس مطلوب'],
  ['??????? ??????', 'الجنسية مطلوبة'],
  ['??? ?????? ?????', 'رقم الجواز مطلوب'],
  ['??? ?????? ??? ????', 'رقم الجواز غير صحيح'],
  ['????? ?????? ?????? ?????', 'تاريخ انتهاء الجواز مطلوب'],
  ['????? ?????? ?????? ??? ????', 'تاريخ انتهاء الجواز غير صحيح'],
  ['??? ?? ???? ????? ???????? ????????', 'انتهاء الجواز يجب أن يكون بعد تاريخ اليوم'],
  ['?????? ?????????? ?????', 'البريد الإلكتروني مطلوب'],
  ['?????? ?????????? ??? ????', 'البريد الإلكتروني غير صحيح'],
  ['??? ?????? ?????', 'رمز الدولة مطلوب'],
  ['??? ?????? ??? ????', 'رقم الهاتف غير صحيح'],
  ['???? ????? ???? ???????? ???????? ???? ????', 'يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.'],
  ['???? ????? ??????. ???? ???????? ??????.', 'تعذر تسعير الرحلات. يرجى المحاولة لاحقًا.'],
  ['???? ????? ?????. ???? ???????? ??? ???? ?? ??????? ?? ?????.', 'تعذر بدء عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'],
  ['?? ???? ?????? ??? ??????', 'لا توجد بيانات للحجز'],
  ['???? ?????? ????? ??????? ??????? ????? ??????? ?????.', 'يرجى اختيار رحلة أولًا ثم المتابعة للحجز.'],
  ['?????? ???????', 'عودة للرحلات'],
  ['???? ?????? ??????', 'بيانات المسافرين'],
  ['??????? ?????????', 'أكمل بيانات المسافرين'],
  ['???? ????? ???????? ??? ?? ?? ???? ????? ?????? ?????.', 'يرجى إدخال بيانات المسافرين كما هي في جواز السفر.'],
  ['?????? ???????', 'بيانات المسافر'],
  ['????? ?????', 'الاسم الأول'],
  ['??? ???????', 'اسم العائلة'],
  ['????? ???????', 'تاريخ الميلاد'],
  ['?????', 'الجنس'],
  ['???', 'ذكر'],
  ['????', 'أنثى'],
  ['??? ??????', 'رقم الجواز'],
  ['????? ?????? ??????', 'تاريخ انتهاء الجواز'],
  ['??????? (??? ISO ??? SA)', 'الجنسية (كود ISO مثل SA)'],
  ['?????? ??????????', 'البريد الإلكتروني'],
  ['??? ??????', 'رمز الدولة'],
  ['???? ?????', 'ملخص الحجز'],
  ['??? ??????:', 'نوع الرحلة:'],
  ['??? ?????????:', 'عدد المسافرين:'],
  ['???? ??????:', 'رحلة الذهاب:'],
  ['???? ??????:', 'رحلة العودة:'],
  ['???? ????????...', 'جارٍ المتابعة...'],
  ['?????? ??? ?????', 'المتابعة للدفع'],
  ['?????? ???????', 'عودة للرحلات'],
  ['??? ???? ?????', 'حجز رحلة طيران'],
  ['???? ??????? ????? Amadeus. ???? ?? ?????? ???????? ?? ??? ????????.', 'فشل الحصول على رمز Amadeus. تحقق من إعدادات الربط على الخادم.'],
  ['???? ??? ??????? ?? ?????? ??????. ???? ??????.', 'فشل البحث عن الرحلات من المزود. حاول لاحقًا.'],
]);

const contextualRules = [
  { test: /email/i, replacement: 'البريد الإلكتروني' },
  { test: /passport/i, replacement: 'رقم الجواز' },
  { test: /gender/i, replacement: 'الجنس' },
  { test: /nationality/i, replacement: 'الجنسية' },
];

function loadMappingFile() {
  if (!fs.existsSync(MAPPING_PATH)) return [];
  try {
    const raw = fs.readFileSync(MAPPING_PATH, 'utf8');
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return json;
    if (json && typeof json === 'object') {
      const entries = [];
      Object.values(json).forEach((value) => {
        if (Array.isArray(value)) entries.push(...value);
      });
      return entries;
    }
  } catch (error) {
    console.warn('Failed to parse mojibake-mapping.json:', error.message);
  }
  return [];
}

const mappingEntries = loadMappingFile();
const mappingPairs = mappingEntries
  .map((entry) => ({
    from: String(entry.from || ''),
    to: String(entry.to || ''),
  }))
  .filter((entry) => entry.from && entry.to);

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

const countArabic = (value) => (value.match(/[\u0600-\u06FF]/g) || []).length;
const countMojibakeLetters = (value) => (value.match(/[طظØÙ]/g) || []).length;
const countReplacement = (value) => (value.match(/[\uFFFD]|ï¿½/g) || []).length;
const countQuestion = (value) => (value.match(/\?/g) || []).length;

const looksLikeMojibake = (value) => {
  if (!value) return false;
  if (mojibakeRegex.test(value)) return true;
  const arabicCount = countArabic(value);
  if (arabicCount > 0) {
    const ratio = countMojibakeLetters(value) / arabicCount;
    if (ratio > 0.3) return true;
  }
  if (questionRegex.test(value)) return true;
  return false;
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

const applyMappings = (value) => {
  let result = value;
  for (const pair of mappingPairs) {
    if (result.includes(pair.from)) {
      result = result.split(pair.from).join(pair.to);
    }
  }
  for (const [from, to] of commonPhraseMap) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
    }
  }
  return result;
};

const applyContextualFixes = (value) => {
  let result = value;
  if (questionRegex.test(result) && countArabic(result) === 0) {
    for (const rule of contextualRules) {
      if (rule.test(result)) {
        result = rule.replacement;
        break;
      }
    }
  }
  return result;
};

const normalizeArabic = (value) => {
  if (!value) return value;
  return value.normalize('NFC');
};

const scoreCandidate = (value) => {
  if (!value) return -Infinity;
  const arabic = countArabic(value);
  const replace = countReplacement(value);
  const question = countQuestion(value);
  return arabic * 3 - replace * 5 - question * 2;
};

const fixSegment = (segment) => {
  let value = segment;
  if (!looksLikeMojibake(value)) return value;
  value = applyMappings(value);

  const candidates = [value];
  const win = decodeWindows1256(value);
  if (win) candidates.push(win);
  const latin = decodeLatin1(value);
  if (latin) candidates.push(latin);

  let best = value;
  let bestScore = scoreCandidate(best);
  for (const candidate of candidates) {
    const normalized = normalizeArabic(candidate);
    const scored = scoreCandidate(normalized);
    if (scored > bestScore) {
      best = normalized;
      bestScore = scored;
    }
  }

  best = applyMappings(best);
  best = applyContextualFixes(best);
  best = normalizeArabic(best);
  return best;
};

const buildFileList = () => {
  const files = new Set(TARGET_FILES.map((f) => path.resolve(ROOT, f)));
  if (!SCAN_ALL) return Array.from(files);

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
      if (!INCLUDE_TOOLS && entry.name === 'tools') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (TEXT_EXT.has(path.extname(entry.name))) files.add(full);
    }
  };
  walk(ROOT);
  return Array.from(files);
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
      changes.push({ file: filePath, line, before: segment, after: fixed });
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

  if (mode) {
    flushSegment();
  }

  return { output, changes };
};

const shouldProcess = (content) => mojibakeRegex.test(content) || questionRegex.test(content);

const main = () => {
  const selfPath = path.resolve(__filename);
  const files = buildFileList()
    .filter((f) => fs.existsSync(f))
    .filter((f) => path.resolve(f) !== selfPath);
  const report = [];
  let changedFiles = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    if (!shouldProcess(raw) && !TARGET_FILES.map((f) => path.resolve(ROOT, f)).includes(file)) continue;
    const { output, changes } = processContent(raw, path.relative(ROOT, file));
    if (changes.length) {
      report.push(...changes);
      if (APPLY && output !== raw) {
        fs.writeFileSync(file, output, 'utf8');
      }
      if (output !== raw) changedFiles += 1;
    }
  }

  console.log('\nArabic Text Reconstruction Report');
  console.log('================================');
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files changed: ${changedFiles}`);
  console.log(`Fixes applied: ${report.length}`);

  if (!report.length) return;
  for (const entry of report) {
    console.log('\n---');
    console.log(`File: ${entry.file}`);
    console.log(`Line: ${entry.line}`);
    console.log(`Before: ${entry.before}`);
    console.log(`After : ${entry.after}`);
  }
};

main();
