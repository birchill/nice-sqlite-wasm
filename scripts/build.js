import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  rmSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const WORK_DIR = path.resolve('work');
const SQLITE_DIR = path.join(WORK_DIR, 'sqlite-src');
const EXT_WASM = path.join(SQLITE_DIR, 'ext', 'wasm');
const DIST_DIR = path.resolve('dist');
const SRC_DIR = path.resolve('src');

// 1) Clean dist
if (existsSync(DIST_DIR)) {
  rmSync(DIST_DIR, { recursive: true, force: true });
}
mkdirSync(DIST_DIR, { recursive: true });

// 2) Build
console.log('Building SQLite...');
execFileSync(path.join(SQLITE_DIR, 'configure'), ['--enable-all'], {
  // It's important to set the current working directory to the SQLite source
  // directory or else it will treat it as an out-of-tree build and not look for
  // EMSDK.
  cwd: SQLITE_DIR,
  stdio: 'inherit',
});
execFileSync('make', ['-C', SQLITE_DIR, 'clean'], { stdio: 'inherit' });
execFileSync('make', ['-C', SQLITE_DIR, 'sqlite3.c'], { stdio: 'inherit' });

console.log('Building WASM target...');
execFileSync('make', ['-C', EXT_WASM, 'clean'], { stdio: 'inherit' });
execFileSync(
  'make',
  [
    '-C',
    EXT_WASM,
    'b-esm',
    'emcc_opt=-Oz',
    'c-pp.D.esm=-Dtarget:es6-module',
    'sqlite3-api.jses=$(sqlite3-license-version.js) ' +
      '$(dir.api)/sqlite3-api-prologue.js ' +
      '$(dir.common)/whwasmutil.js ' +
      '$(dir.jacc)/jaccwabyt.js ' +
      '$(dir.api)/sqlite3-api-glue.c-pp.js ' +
      '$(sqlite3-api-build-version.js) ' +
      '$(dir.api)/sqlite3-api-oo1.c-pp.js ' +
      // Omit $(dir.api)/sqlite3-api-worker1.c-pp.js
      '$(dir.api)/sqlite3-vfs-helper.c-pp.js ' +
      '$(dir.api)/sqlite3-vtab-helper.c-pp.js ' +
      // Omit $(dir.api)/sqlite3-vfs-opfs.c-pp.js
      '$(dir.api)/sqlite3-vfs-opfs-sahpool.c-pp.js ' +
      '$(dir.api)/sqlite3-api-cleanup.js',
  ],
  { stdio: 'inherit' }
);

// 3) Strip comments
console.log('Building tool to strip comments...');
execFileSync('make', ['-C', EXT_WASM, 't-stripccomments'], {
  stdio: 'inherit',
});
console.log('Stripping C comments from output...');
const inFd = openSync(path.join(EXT_WASM, 'jswasm', 'sqlite3.mjs'), 'r');
const apiFileOut = path.join(EXT_WASM, 'jswasm', 'sqlite3-stripped.mjs');
const outFd = openSync(apiFileOut, 'w');
try {
  execFileSync(path.join(SQLITE_DIR, 'tool', 'stripccomments'), ['-k', '-k'], {
    cwd: SQLITE_DIR,
    stdio: [inFd, outFd, 'inherit'],
  });
} finally {
  closeSync(inFd);
  closeSync(outFd);
}

// 4) Format output
console.log('Formatting output with oxfmt...');
execFileSync('pnpm', ['oxfmt', apiFileOut], { stdio: 'inherit' });

// 5) Copy output to dist
const wasmModule = path.join(EXT_WASM, 'jswasm', 'esm', 'sqlite3.wasm');
cpSync(wasmModule, path.join(DIST_DIR, 'sqlite3.wasm'));
cpSync(apiFileOut, path.join(DIST_DIR, 'sqlite3.js'));
const types = path.join(SRC_DIR, 'sqlite3.d.ts');
cpSync(types, path.join(DIST_DIR, 'sqlite3.d.ts'));
const revFile = path.join(WORK_DIR, 'sqlite-rev.txt');
cpSync(revFile, path.join(DIST_DIR, 'sqlite-rev.txt'));

console.log('Build complete: dist/sqlite3.{js,wasm,d.ts}');
