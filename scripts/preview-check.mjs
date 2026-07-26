import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const required = [
  'src/pages/index.astro',
  'src/components/PrototypeDisclaimer.astro',
  'package.json',
];

for (const rel of required) {
  if (!existsSync(join(root, rel))) {
    console.error(`preview:check missing ${rel}`);
    process.exit(1);
  }
}

const backend = process.env.WEBDEV_BACKEND_TYPE || 'none';

if (backend === 'local-sqlite') {
  const dbPath = join(root, 'preview.db');
  if (!existsSync(dbPath)) {
    console.error('preview:check SQLite db missing — run db:seed');
    process.exit(1);
  }
  try {
    const { openDb } = await import('./db-lib.mjs');
    const db = openDb();
    const row = db.prepare('SELECT COUNT(*) AS c FROM records').get();
    if (!row || row.c < 1) {
      console.error('preview:check seed data missing');
      process.exit(1);
    }
    db.close();
  } catch (err) {
    console.error('preview:check sqlite query failed:', err.message);
    process.exit(1);
  }
}

console.log(JSON.stringify({ ok: true, backend }));
process.exit(0);
