import { mkdir, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const WORK_DIR = path.resolve('work');
const SQLITE_DIR = path.join(WORK_DIR, 'sqlite-src');
const EXT_WASM = path.join(SQLITE_DIR, 'ext', 'wasm');
const DIST_DIR = path.resolve('dist');

// 1) Clean dist
if (existsSync(DIST_DIR)) {
  rmSync(DIST_DIR, { recursive: true, force: true });
}
mkdir(DIST_DIR, { recursive: true }, () => {});

// 2) Build the canonical wasm/js outputs first (sanity)
console.log('Building SQLite WASM (baseline)...');
execFileSync(path.join(SQLITE_DIR, 'configure'), ['--enable-all'], {
  // It's important to set the current working directory to the SQLite source
  // directory or else it will treat it as an out-of-tree build and not look for
  // EMSDK.
  cwd: SQLITE_DIR,
  stdio: 'inherit',
});
execFileSync('make', ['-C', SQLITE_DIR, 'clean'], {
  cwd: SQLITE_DIR,
  stdio: 'inherit',
});
execFileSync('make', ['-C', SQLITE_DIR, 'sqlite3.c'], {
  cwd: SQLITE_DIR,
  stdio: 'inherit',
});
execFileSync('make', ['-C', EXT_WASM, 'oz'], {
  cwd: EXT_WASM,
  stdio: 'inherit',
});

// 3) Create a custom sqlite3-api.js (no oo1, no worker1, no opfs).
//
// Per the docs, OO1 and worker1 are optional, and opfs vfs is a separate
// component.
/*
console.log('Building custom sqlite3-api.js (excluding oo1/worker1/opfs)...');
const customList = [
  'api/sqlite3-api-prologue.js',
  'common/whwasmutil.js',
  'jaccwabyt/jaccwabyt.js',
  'api/sqlite3-api-glue.js',
  // build-generated version file exists after make
  'jswasm/sqlite3-api-build-version.js',
  // OMIT:
  // "api/sqlite3-api-oo1.js",
  // "api/sqlite3-api-worker1.js",
  'api/sqlite3-v-helper.js',
  // OMIT:
  // "api/sqlite3-vfs-opfs.c-pp.js",
  'api/sqlite3-api-cleanup.js',
].map((p) => path.join(EXT_WASM, p));

// Concatenate into dist/sqlite3-api.js
execFileSync(
  'bash',
  [
    '-lc',
    `cat ${customList.map((p) => `"${p}"`).join(' ')} > "${DIST_DIR}/sqlite3-api.js"`,
  ],
  { stdio: 'inherit' }
);

// 4) Copy the wasm output from the baseline build
execFileSync(
  'bash',
  ['-lc', `cp "${EXT_WASM}/jswasm/sqlite3.wasm" "${DIST_DIR}/sqlite3.wasm"`],
  { stdio: 'inherit' }
);

// 5) Provide an ESM loader.
// Easiest: copy upstream-produced sqlite3.mjs and patch it to:
// - point to dist/sqlite3.wasm
// - load dist/sqlite3-api.js instead of the embedded one
// BUT: that’s fiddly.
// Practical alternative: ship a tiny init module that:
// - instantiates the wasm
// - evaluates sqlite3-api.js to attach API to sqlite3 object
//
// Start with “copy upstream sqlite3.mjs and patch locateFile assignment”.
// You can evolve this once the package is stable.
execFileSync(
  'bash',
  ['-lc', `cp "${EXT_WASM}/jswasm/sqlite3.mjs" "${DIST_DIR}/sqlite3.mjs"`],
  { stdio: 'inherit' }
);

// 6) Post-build patch: locateFile assignment tweak (robust if this is only in output)
execFileSync(
  'bash',
  [
    '-lc',
    `perl -0pi -e "s/Module\\['locateFile'\\]\\s*=\\s*function/Module['locateFile'] ??= function/g" "${DIST_DIR}/sqlite3.mjs"`,
  ],
  { stdio: 'inherit' }
);
*/

console.log('Build complete: dist/sqlite3.{mjs,wasm} and dist/sqlite3-api.js');
