# @birchill/sqlite-wasm-sahpool

This is a custom build of SQLite intended to:

- Remove the "opfs" VFS, only providing the "opfs-sahpool" VFS instead
- Allow passing in a custom path for the WASM module in order to support
  cache-busting filenames / bundlers.

## Usage

TODO

## Building

### Fetching the SQLite source code

Ensure `sqlite-revision.txt` contains the desired SQLite version (e.g.
`version-3.51.1` or any tag from the
[SQLite git repository](https://github.com/sqlite/sqlite.git)).

Then run:

```
pnpm run fetch
```
