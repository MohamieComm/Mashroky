#!/usr/bin/env node
/**
 * Encoding Auto-Fix Script
 * Automatically detects and fixes Mojibake (encoding issues) in project files
 * 
 * Usage: node tools/encoding-auto-fix-clean.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  targetDirs: ['app', 'flight-backend', 'src', 'public', 'components', 'integrations'],
  fileExtensions: ['.html', '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.md'],
  encoding: 'utf8',
  backupDir: '.encoding-backups',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Statistics tracker
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  filesSkipped: 0,
  filesErrored: 0,
  issuesFixed: 0,
  backupsCreated: 0,
};

// Logger utility
const logger = {
  info: (msg) => console.log(`[INFO]  ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warning: (msg) => console.log(`[WARNING]  ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  verbose: (msg) => CONFIG.verbose && console.log(`[VERBOSE] ${msg}`),
  dryRun: (msg) => CONFIG.dryRun && console.log(`[DRY RUN] ${msg}`),
};

function hasBOM(buffer) {
  if (buffer.length >= 3) {
    return buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
  }
  return false;
}

function removeBOM(buffer) {
  if (hasBOM(buffer)) {
    return buffer.slice(3);
  }
  return buffer;
}

function hasMojibake(content) {
  if (content.includes('\uFFFD')) return true;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)) return true;
  return false;
}

function fixBasicIssues(content) {
  let fixed = content;
  const beforeCount = (fixed.match(/\uFFFD/g) || []).length;
  
  fixed = fixed.replace(/\uFFFD+/g, '');
  fixed = fixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  fixed = fixed.replace(/\uFEFF/g, '');
  
  const afterCount = (fixed.match(/\uFFFD/g) || []).length;
  stats.issuesFixed += (beforeCount - afterCount);
  
  return fixed;
}

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

function processFile(filePath) {
  try {
    stats.filesScanned++;
    logger.verbose(`Scanning: ${filePath}`);
    
    const buffer = fs.readFileSync(filePath);
    const hadBOM = hasBOM(buffer);
    const cleanBuffer = removeBOM(buffer);
    let content = cleanBuffer.toString('utf8');
    
    if (!hasMojibake(content) && !hadBOM) {
      logger.verbose(`File is clean: ${filePath}`);
      stats.filesSkipped++;
      return;
    }
    
    logger.info(`Found encoding issues in: ${filePath}`);
    if (hadBOM) logger.verbose('  - BOM detected');
    if (content.includes('\uFFFD')) logger.verbose('  - Replacement characters detected');
    
    if (!CONFIG.dryRun) {
      if (!createBackup(filePath)) {
        logger.warning(`Skipping ${filePath} - backup failed`);
        stats.filesSkipped++;
        return;
      }
    }
    
    const fixed = fixBasicIssues(content);
    
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

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    logger.warning(`Directory not found: ${dir}`);
    return;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
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

function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('ENCODING FIX REPORT');
  console.log('='.repeat(60));
  console.log(`Files scanned:      ${stats.filesScanned}`);
  console.log(`Files fixed:        ${stats.filesFixed}`);
  console.log(`Files skipped:      ${stats.filesSkipped}`);
  console.log(`Files with errors:  ${stats.filesErrored}`);
  console.log(`Issues fixed:       ${stats.issuesFixed}`);
  console.log(`Backups created:    ${stats.backupsCreated}`);
  console.log('='.repeat(60));
  
  if (CONFIG.dryRun) {
    console.log('\nDRY RUN MODE - No files were actually modified');
    console.log('Run without --dry-run to apply changes\n');
  } else if (stats.filesFixed > 0) {
    console.log('\nEncoding fixes applied successfully!');
    console.log(`Backups stored in: ${CONFIG.backupDir}/\n`);
  }
}

function main() {
  console.log('Starting Encoding Auto-Fix Script...\n');
  
  if (CONFIG.dryRun) logger.info('Running in DRY RUN mode - no files will be modified');
  if (CONFIG.verbose) logger.info('Verbose mode enabled');
  
  if (!CONFIG.dryRun && !fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  for (const dir of CONFIG.targetDirs) {
    logger.info(`Scanning directory: ${dir}`);
    scanDirectory(dir);
  }
  
  printReport();
  process.exit(stats.filesErrored > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { fixBasicIssues, hasMojibake, processFile };