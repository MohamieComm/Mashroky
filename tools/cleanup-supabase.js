const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  });
}

loadEnvFile();

const argv = process.argv.slice(2);
const confirm = argv.includes('--confirm');
const includeUsers = argv.includes('--include-users');
const includeKeys = argv.includes('--include-keys');
const customTablesArg = argv.find((a) => a.startsWith('--tables='));

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const restBase = `${supabaseUrl}/rest/v1`;
const baseHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

const defaultTables = [
  'admin_settings',
  'flights',
  'hotels',
  'offers',
  'activities',
  'articles',
  'destinations',
  'partners',
  'airlines',
  'pages',
  'seasons',
];

if (includeUsers) defaultTables.push('users_admin');
if (includeKeys) defaultTables.push('api_keys');

const tables = customTablesArg
  ? customTablesArg.split('=')[1].split(',').map((t) => t.trim()).filter(Boolean)
  : defaultTables;

const priorityColumns = ['id', 'created_at', 'updated_at'];

async function getSampleRow(table) {
  const url = `${restBase}/${table}?select=*&limit=1`;
  const res = await fetch(url, { headers: { ...baseHeaders, Accept: 'application/json' } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to read sample from ${table}: ${res.status} ${body}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : null;
}

async function getCount(table) {
  const url = `${restBase}/${table}?select=id`;
  const res = await fetch(url, {
    headers: { ...baseHeaders, Accept: 'application/json', Prefer: 'count=exact' },
  });
  if (!res.ok) return null;
  const contentRange = res.headers.get('content-range');
  if (!contentRange) return null;
  const total = contentRange.split('/')[1];
  return total ? Number(total) : null;
}

async function deleteAll(table, filterColumn) {
  const url = `${restBase}/${table}?${encodeURIComponent(filterColumn)}=not.is.null`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { ...baseHeaders, Prefer: 'return=minimal' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Delete failed for ${table}: ${res.status} ${body}`);
  }
}

async function run() {
  console.log('Supabase cleanup script');
  console.log('Target:', supabaseUrl);
  console.log('Tables:', tables.join(', '));

  const tableMeta = [];
  for (const table of tables) {
    try {
      const count = await getCount(table);
      const sample = await getSampleRow(table);
      if (!sample) {
        tableMeta.push({ table, count, filter: null, empty: true });
        console.log(`- ${table}: empty or no rows found`);
        continue;
      }
      const columns = Object.keys(sample);
      const filter = priorityColumns.find((c) => columns.includes(c)) || columns[0];
      tableMeta.push({ table, count, filter, empty: false });
      console.log(`- ${table}: rows=${count ?? 'unknown'}, filter=${filter}`);
    } catch (err) {
      console.error(`- ${table}: skipped (${err.message})`);
      tableMeta.push({ table, error: err.message });
    }
  }

  if (!confirm) {
    console.log('\nDry run: no deletions performed.');
    console.log('Re-run with --confirm to delete rows.');
    process.exit(0);
  }

  console.log('\nDeleting rows...');
  for (const meta of tableMeta) {
    if (meta.empty || meta.error) continue;
    try {
      await deleteAll(meta.table, meta.filter);
      console.log(`✔ Deleted rows from ${meta.table}`);
    } catch (err) {
      console.error(`✖ Failed to delete ${meta.table}: ${err.message}`);
    }
  }
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
