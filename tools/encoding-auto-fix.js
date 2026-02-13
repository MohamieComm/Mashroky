#!/usr/bin/env node
/**
 * Encoding Auto-Fix Script
 * Automatically detects and fixes Mojibake (encoding issues) in project files
 * 
 * Usage: node tools/encoding-auto-fix.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  targetDirs: ['app', 'flight-backend', 'src', 'public', 'components', 'integrations'],
  fileExtensions: ['.html', '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.md'],
  encoding: 'utf8',
  backupDir: '.encoding-backups',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Mojibake detection and correction patterns
const MOJIBAKE_PATTERNS = [
  // Common Arabic mojibake patterns
  { broken: /Ø§Ù„/g, fixed: 'ال' },
  { broken: /Ø¹Ø±Ø¨ÙŠ/g, fixed: 'عربي' },
  { broken: /Ù…Ø­Ù…Ø¯/g, fixed: 'محمد' },
  { broken: /Ø§Ù„Ø±ÙŠØ§Ø¶/g, fixed: 'الرياض' },
  { broken: /Ø¬Ø¯Ø©/g, fixed: 'جدة' },
  { broken: /Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©/g, fixed: 'المدينة' },
  { broken: /Ù…ÙƒØ©/g, fixed: 'مكة' },
  { broken: /Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©/g, fixed: 'السعودية' },
  { broken: /Ø­Ø¬Ø²/g, fixed: 'حجز' },
  { broken: /Ø±Ø­Ù„Ø©/g, fixed: 'رحلة' },
  { broken: /Ù…Ø³Ø§ÙØ±/g, fixed: 'مسافر' },
  { broken: /Ø·ÙŠØ±Ø§Ù†/g, fixed: 'طيران' },
  { broken: /ÙÙ†Ø¯Ù‚/g, fixed: 'فندق' },
  { broken: /Ø³ÙŠØ§Ø­Ø©/g, fixed: 'سياحة' },
  { broken: /Ø®Ø¯Ù…Ø§Øª/g, fixed: 'خدمات' },
  
  // Windows-1252 to UTF-8 common issues
  { broken: /Ã©/g, fixed: 'é' },
  { broken: /Ã¨/g, fixed: 'è' },
  { broken: /Ã /g, fixed: 'à' },
  { broken: /Ã§/g, fixed: 'ç' },
  
  // BOM markers that shouldn't be visible
  { broken: /\uFEFF/g, fixed: '' },
  { broken: /\u00EF\u00BB\u00BF/g, fixed: '' },
];

// Extended mojibake mapping
const EXTENDED_MOJIBAKE_MAP = {
  // Arabic letters
  'Ø§': 'ا', 'Ø¨': 'ب', 'Øª': 'ت', 'Ø«': 'ث', 'Ø¬': 'ج', 'Ø­': 'ح', 'Ø®': 'خ', 'Ø¯': 'د',
  'Ø°': 'ذ', 'Ø±': 'ر', 'Ø²': 'ز', 'Ø³': 'س', 'Ø´': 'ش', 'Øµ': 'ص', 'Ø¶': 'ض', 'Ø·': 'ط',
  'Ø¸': 'ظ', 'Ø¹': 'ع', 'ØºØ': 'غ', 'Ù': 'ف', 'Ù‚': 'ق', 'Ùƒ': 'ك', 'Ù„': 'ل', 'Ù…': 'م',
  'Ù†': 'ن', 'Ù‡': 'ه', 'Ùˆ': 'و', 'ÙŠ': 'ي', 'Ø©': 'ة', 'Ù‰': 'ى', 'Ø¡': 'ء',
  
  // Arabic diacritics
  'ÙŽ': 'َ', 'Ù': 'ُ', 'Ù': 'ِ', 'Ù'': 'ّ', 'Ù'': 'ْ', 'Ù‹': 'ً', 'Ù': 'ٌ', 'Ù': 'ٍ',
};

// Statistics tracker
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  filesSkipped: 0,
  filesErrored: 0,
  patternsFixed: 0,
  backupsCreated: 0,
};

// Logger utility
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  verbose: (msg) => CONFIG.verbose && console.log(`🔍 ${msg}`),
  dryRun: (msg) => CONFIG.dryRun && console.log(`🧪 [DRY RUN] ${msg}`),
};

/**
 * Check if file contains BOM
 */
function hasBOM(buffer) {
  if (buffer.length >= 3) {
    return buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
  }
  return false;
}

/**
 * Remove BOM from buffer
 */
function removeBOM(buffer) {
  if (hasBOM(buffer)) {
    return buffer.slice(3);
  }
  return buffer;
}

/**
 * Detect if content has mojibake
 */
function hasMojibake(content) {
  // Check for common mojibake patterns
  for (const pattern of MOJIBAKE_PATTERNS) {
    if (pattern.broken.test(content)) {
      return true;
    }
  }
  
  // Check for replacement character
  if (content.includes('\uFFFD')) {
    return true;
  }
  
  // Check for suspicious character sequences (Latin-1 encoded UTF-8)
  if (/[Ã][€-¿]/.test(content)) {
    return true;
  }
  
  // Check for Arabic range with common encoding issues
  const arabicWithIssues = /[\u00C0-\u00FF]{2,}/.test(content) && /Ø|Ù/.test(content);
  
  return arabicWithIssues;
}

/**
 * Fix mojibake in content
 */
function fixMojibake(content) {
  let fixed = content;
  let changesCount = 0;
  
  // Apply pattern-based fixes
  for (const pattern of MOJIBAKE_PATTERNS) {
    const matches = fixed.match(pattern.broken);
    if (matches) {
      fixed = fixed.replace(pattern.broken, pattern.fixed);
      changesCount += matches.length;
    }
  }
  
  // Apply character-by-character mapping for extended cases
  let extendedFixed = '';
  let i = 0;
  while (i < fixed.length) {
    // Check for multi-byte sequences
    let matched = false;
    for (let len = 4; len >= 2; len--) {
      const substr = fixed.substr(i, len);
      if (EXTENDED_MOJIBAKE_MAP[substr]) {
        extendedFixed += EXTENDED_MOJIBAKE_MAP[substr];
        i += len;
        changesCount++;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Check single character
      const char = fixed[i];
      if (EXTENDED_MOJIBAKE_MAP[char]) {
        extendedFixed += EXTENDED_MOJIBAKE_MAP[char];
        changesCount++;
      } else {
        extendedFixed += char;
      }
      i++;
    }
  }
  
  stats.patternsFixed += changesCount;
  return extendedFixed;
}

/**
 * Try to detect and fix encoding issues by re-encoding
 */
function fixEncoding(content) {
  try {
    // Try to detect if content was incorrectly decoded as Latin-1
    const buffer = Buffer.from(content, 'latin1');
    const utf8Content = buffer.toString('utf8');
    
    // Check if the re-encoded version has fewer issues
    const originalIssues = (content.match(/\uFFFD/g) || []).length;
    const reEncodedIssues = (utf8Content.match(/\uFFFD/g) || []).length;
    
    if (reEncodedIssues < originalIssues) {
      logger.verbose('Re-encoding fixed replacement characters');
      return utf8Content;
    }
  } catch (e) {
    logger.verbose(`Re-encoding attempt failed: ${e.message}`);
  }
  
  return content;
}

/**
 * Create backup of file
 */
function createBackup(filePath) {
  try {
    const backupPath = path.join(CONFIG.backupDir, filePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, backupPath);
    stats.backupsCreated++;
    logger.verbose(`Backup created: ${backupPath}`);
    return true;
  } catch (e) {
    logger.error(`Failed to create backup for ${filePath}: ${e.message}`);
    return false;
  }
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    logger.verbose(`Scanning: ${filePath}`);
    
    // Read file as buffer first
    const buffer = fs.readFileSync(filePath);
    
    // Remove BOM if present
    const cleanBuffer = removeBOM(buffer);
    
    // Convert to string
    let content = cleanBuffer.toString('utf8');
    
    // Check if file needs fixing
    if (!hasMojibake(content)) {
      logger.verbose(`✓ File is clean: ${filePath}`);
      stats.filesSkipped++;
      return;
    }
    
    logger.info(`Found encoding issues in: ${filePath}`);
    
    // Create backup before modifying
    if (!CONFIG.dryRun) {
      if (!createBackup(filePath)) {
        logger.warning(`Skipping ${filePath} - backup failed`);
        stats.filesSkipped++;
        return;
      }
    }
    
    // Apply fixes
    let fixed = fixMojibake(content);
    fixed = fixEncoding(fixed);
    
    // Verify that fix actually improved the content
    const originalReplacementCount = (content.match(/\uFFFD/g) || []).length;
    const fixedReplacementCount = (fixed.match(/\uFFFD/g) || []).length;
    
    if (fixedReplacementCount > originalReplacementCount) {
      logger.warning(`Fix made things worse for ${filePath}, skipping`);
      stats.filesSkipped++;
      return;
    }
    
    // Write fixed content
    if (CONFIG.dryRun) {
      logger.dryRun(`Would fix: ${filePath}`);
    } else {
      fs.writeFileSync(filePath, fixed, { encoding: 'utf8' });
      logger.success(`Fixed: ${filePath}`);
    }
    
    stats.filesFixed++;
  } catch (e) {
    logger.error(`Error processing ${filePath}: ${e.message}`);
    stats.filesErrored++;
  }
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    logger.warning(`Directory not found: ${dir}`);
    return;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, .git, and backup directories
    if (entry.isDirectory()) {
      const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', CONFIG.backupDir];
      if (skipDirs.includes(entry.name)) {
        logger.verbose(`Skipping directory: ${fullPath}`);
        continue;
      }
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (CONFIG.fileExtensions.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

/**
 * Print summary report
 */
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENCODING FIX REPORT');
  console.log('='.repeat(60));
  console.log(`Files scanned:      ${stats.filesScanned}`);
  console.log(`Files fixed:        ${stats.filesFixed}`);
  console.log(`Files skipped:      ${stats.filesSkipped}`);
  console.log(`Files with errors:  ${stats.filesErrored}`);
  console.log(`Patterns fixed:     ${stats.patternsFixed}`);
  console.log(`Backups created:    ${stats.backupsCreated}`);
  console.log('='.repeat(60));
  
  if (CONFIG.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files were actually modified');
    console.log('   Run without --dry-run to apply changes\n');
  } else if (stats.filesFixed > 0) {
    console.log('\n✅ Encoding fixes applied successfully!');
    console.log(`   Backups stored in: ${CONFIG.backupDir}/\n`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Encoding Auto-Fix Script...\n');
  
  if (CONFIG.dryRun) {
    logger.info('Running in DRY RUN mode - no files will be modified');
  }
  
  if (CONFIG.verbose) {
    logger.info('Verbose mode enabled');
  }
  
  // Create backup directory
  if (!CONFIG.dryRun && !fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  // Scan all target directories
  for (const dir of CONFIG.targetDirs) {
    logger.info(`Scanning directory: ${dir}`);
    scanDirectory(dir);
  }
  
  // Print final report
  printReport();
  
  // Exit with appropriate code
  process.exit(stats.filesErrored > 0 ? 1 : 0);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixMojibake, hasMojibake, processFile };