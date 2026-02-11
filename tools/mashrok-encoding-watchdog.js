#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WATCH_DIRS = [path.join(ROOT, 'app'), path.join(ROOT, 'flight-backend')];

const argv = process.argv.slice(2);
const MODE_CHECK = argv.includes('--check');
const MODE_FIX = argv.includes('--fix') || argv.includes('--apply');

const TEXT_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.txt',
  '.yml',
  '.yaml',
  '.env',
  '.toml',
]);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache',
  'app\\node_modules',
  'flight-backend\\node_modules',
]);

const mojibakeRegex = /[\uFFFD]|ï¿½|Ã|Â|â€“|â€”|â€|â€™|â€œ|â€�/;
const questionRegex = /\?{3,}/;

const hasTextDecoder = typeof TextDecoder !== 'undefined';
const windows1256Decoder = hasTextDecoder ? new TextDecoder('windows-1256') : null;

const isIgnoredPath = (filePath) => {
  const normalized = filePath.replace(/\//g, '\\');
  for (const dir of IGNORE_DIRS) {
    if (normalized.includes(`\\${dir}\\`) || normalized.endsWith(`\\${dir}`)) return true;
  }
  return false;
};

const isTextFile = (filePath) => TEXT_EXT.has(path.extname(filePath).toLowerCase());

const isValidUtf8 = (buffer) => {
  let i = 0;
  while (i < buffer.length) {
    const byte1 = buffer[i];
    if (byte1 <= 0x7f) {
      i += 1;
      continue;
    }
    if (byte1 >= 0xc2 && byte1 <= 0xdf) {
      if (i + 1 >= buffer.length) return false;
      const byte2 = buffer[i + 1];
      if (byte2 < 0x80 || byte2 > 0xbf) return false;
      i += 2;
      continue;
    }
    if (byte1 >= 0xe0 && byte1 <= 0xef) {
      if (i + 2 >= buffer.length) return false;
      const byte2 = buffer[i + 1];
      const byte3 = buffer[i + 2];
      if (byte2 < 0x80 || byte2 > 0xbf || byte3 < 0x80 || byte3 > 0xbf) return false;
      if (byte1 === 0xe0 && byte2 < 0xa0) return false;
      if (byte1 === 0xed && byte2 >= 0xa0) return false;
      i += 3;
      continue;
    }
    if (byte1 >= 0xf0 && byte1 <= 0xf4) {
      if (i + 3 >= buffer.length) return false;
      const byte2 = buffer[i + 1];
      const byte3 = buffer[i + 2];
      const byte4 = buffer[i + 3];
      if (
        byte2 < 0x80 ||
        byte2 > 0xbf ||
        byte3 < 0x80 ||
        byte3 > 0xbf ||
        byte4 < 0x80 ||
        byte4 > 0xbf
      )
        return false;
      if (byte1 === 0xf0 && byte2 < 0x90) return false;
      if (byte1 === 0xf4 && byte2 > 0x8f) return false;
      i += 4;
      continue;
    }
    return false;
  }
  return true;
};

const decodeFallback = (buffer) => {
  if (windows1256Decoder) {
    try {
      return windows1256Decoder.decode(buffer);
    } catch {
      // ignore
    }
  }
  return buffer.toString('latin1');
};

const normalizeToUtf8 = (filePath, buffer) => {
  let body = buffer;
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    body = buffer.slice(3);
  }
  if (isValidUtf8(body)) {
    return { changed: buffer !== body, text: body.toString('utf8') };
  }
  const decoded = decodeFallback(body);
  return { changed: true, text: decoded };
};

const detectMojibake = (text) => mojibakeRegex.test(text) || questionRegex.test(text);

const runRebuilder = () => {
  const rebuilder = path.join(ROOT, 'tools', 'mashrok-arabic-rebuilder.js');
  if (!fs.existsSync(rebuilder)) return { ok: false, message: 'arabic rebuilder not found' };
  const result = spawnSync(process.execPath, [rebuilder, '--apply', '--scan'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  return { ok: result.status === 0 };
};

const scanFile = (filePath, { allowFix }) => {
  if (!fs.existsSync(filePath)) return { ok: true };
  if (!isTextFile(filePath)) return { ok: true };
  if (isIgnoredPath(filePath)) return { ok: true };

  const buffer = fs.readFileSync(filePath);
  const normalized = normalizeToUtf8(filePath, buffer);
  let issues = [];

  let encodingIssue = !isValidUtf8(buffer) || normalized.changed;
  if (encodingIssue && allowFix) {
    fs.writeFileSync(filePath, normalized.text, 'utf8');
    encodingIssue = false;
  }
  if (encodingIssue) {
    issues.push('non_utf8');
  }

  const text = normalized.text ?? buffer.toString('utf8');
  let mojibakeIssue = detectMojibake(text);
  if (mojibakeIssue && allowFix) {
    runRebuilder();
    mojibakeIssue = false;
  }
  if (mojibakeIssue) {
    issues.push('mojibake');
  }

  return { ok: issues.length === 0, issues };
};

const walk = (dir, handler) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, handler);
    else handler(full);
  }
};

const scanOnce = ({ allowFix }) => {
  const results = [];
  for (const dir of WATCH_DIRS) {
    if (!fs.existsSync(dir)) continue;
    walk(dir, (filePath) => {
      const result = scanFile(filePath, { allowFix });
      if (!result.ok) results.push({ filePath, issues: result.issues });
    });
  }
  return results;
};

const logIssues = (issues) => {
  if (!issues.length) return;
  console.log('\nEncoding Watchdog Issues');
  console.log('========================');
  for (const issue of issues) {
    console.log(`${issue.filePath}: ${issue.issues.join(', ')}`);
  }
};

const watchFiles = () => {
  const debounce = new Map();
  const trigger = (filePath) => {
    if (!filePath || !isTextFile(filePath)) return;
    if (isIgnoredPath(filePath)) return;
    if (debounce.has(filePath)) clearTimeout(debounce.get(filePath));
    debounce.set(
      filePath,
      setTimeout(() => {
        scanFile(filePath, { allowFix: true });
        debounce.delete(filePath);
      }, 200)
    );
  };

  for (const dir of WATCH_DIRS) {
    if (!fs.existsSync(dir)) continue;
    try {
      fs.watch(
        dir,
        { recursive: true },
        (_event, filename) => {
          if (!filename) return;
          trigger(path.join(dir, filename));
        }
      );
      console.log(`Watching ${dir}`);
    } catch (error) {
      console.warn(`Failed to watch ${dir}: ${error.message}`);
    }
  }
  console.log('Arabic Encoding Watchdog is running...');
};

if (MODE_CHECK) {
  const issues = scanOnce({ allowFix: false });
  logIssues(issues);
  process.exit(issues.length ? 1 : 0);
} else if (MODE_FIX) {
  const issues = scanOnce({ allowFix: true });
  logIssues(issues);
  process.exit(issues.length ? 1 : 0);
} else {
  watchFiles();
}
