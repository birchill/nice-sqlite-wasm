import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SQLITE_DIR = path.resolve('work/sqlite-src');
const PATCH_DIR = path.resolve('patches');

const patches = readdirSync(PATCH_DIR)
  .filter((f) => f.endsWith('.patch'))
  .sort();

if (patches.length === 0) {
  console.log('No patches to apply.');
  process.exit(0);
}

for (const p of patches) {
  const full = path.join(PATCH_DIR, p);
  console.log(`Applying ${p}...`);
  execFileSync('git', ['apply', '--whitespace=nowarn', full], {
    cwd: SQLITE_DIR,
    stdio: 'inherit',
  });
}

console.log('All patches applied.');
