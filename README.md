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

### Building the WASM module

#### Getting Emscripted

First you need to [install
Emscripten](https://emscripten.org/docs/getting_started/downloads.html).

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh # Or source ./emsdk_env.fish etc.
```

#### Getting `wasm-strip` (from `wabt`)

Then you need to install
[wabt](https://github.com/WebAssembly/wabt?tab=readme-ov-file) for to make
`wasm-strip` available.

Critically, this must be version 1.0.36 or higher or else `wasm-strip` will fail
on the 64-bit build with "tables may not be 64-bit". We don't actually need the
64-bit build but there's no way to turn it off easily.

As of this writing, using `sudo apt install wabt` gives you version 1.0.34 which
is not high enough.

Instead you probably want to download the latest release from
[https://github.com/WebAssembly/wabt/releases](https://github.com/WebAssembly/wabt/releases):

```
wget https://github.com/WebAssembly/wabt/releases/download/1.0.39/wabt-1.0.39-linux-x64.tar.gz
tar -xzf wabt-1.0.39-linux-x64.tar.gz
sudo mv ~/wabt-1.0.39 /usr/local/wabt-1.0.39
sudo ln -s /usr/local/wabt-1.0.39 /usr/local/wabt
sudo ln -s /usr/local/wabt/bin/* /usr/local/bin/
```

(or `brew install wabt` on macOS)

#### Actually building

Then run:

```
pnpm build
```
