import fs from 'fs/promises';
import path from 'path';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'amadeus-errors.log');

async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch {
    // ignore directory creation errors
  }
}

export async function logAmadeusError(message, meta = {}) {
  try {
    await ensureLogDir();
    const payload = {
      timestamp: new Date().toISOString(),
      message,
      meta,
    };
    await fs.appendFile(LOG_FILE, `${JSON.stringify(payload)}\n`, 'utf8');
  } catch {
    // ignore logging failures
  }
}
