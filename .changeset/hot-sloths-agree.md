---
"@birchill/nice-sqlite-wasm": minor
---

Update to SQLite 3.53.1

BREAKING CHANGE: Rather than overriding `locateFile` to load the WASM file, use
the `emscriptenLocateFile` option instead.
