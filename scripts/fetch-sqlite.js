import { existsSync, readFileSync, rmSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const WORK_DIR = path.resolve('work');
const SQLITE_DIR = path.join(WORK_DIR, 'sqlite-src');
const REV_FILE = path.resolve('sqlite-revision.txt');

const SQLITE_REPO =
  process.env.SQLITE_REPO ?? 'https://github.com/sqlite/sqlite.git';

if (!existsSync(REV_FILE)) {
  throw new Error(`Missing ${REV_FILE}. This file must be checked in.`);
}

const fileRef = readFileSync(REV_FILE, 'utf8').trim();
if (!fileRef) {
  throw new Error(`${REV_FILE} is empty.`);
}

const SQLITE_REF = process.env.SQLITE_REF ?? fileRef;

await mkdir(WORK_DIR, { recursive: true });

if (existsSync(SQLITE_DIR)) {
  console.log(`Removing existing ${SQLITE_DIR}`);
  rmSync(SQLITE_DIR, { recursive: true, force: true });
}

console.log(`Cloning ${SQLITE_REPO}...`);
execFileSync(
  'git',
  ['clone', '--depth', '1', '--no-tags', SQLITE_REPO, SQLITE_DIR],
  { stdio: 'inherit' }
);

console.log(`Fetching ref ${SQLITE_REF}...`);
execFileSync('git', ['fetch', '--depth', '1', 'origin', SQLITE_REF], {
  cwd: SQLITE_DIR,
  stdio: 'inherit',
});
execFileSync('git', ['checkout', 'FETCH_HEAD'], {
  cwd: SQLITE_DIR,
  stdio: 'inherit',
});

// Record what we actually fetched for traceability
const resolvedSha = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: SQLITE_DIR,
})
  .toString()
  .trim();

await writeFile(path.join(WORK_DIR, 'sqlite-rev.txt'), resolvedSha + '\n');

console.log(`SQLite checked out at ${resolvedSha}`);
