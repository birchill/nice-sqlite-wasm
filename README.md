# @birchill/sqlite-wasm-sahpool

This is a custom build of SQLite intended to:

- Remove the "opfs" VFS, only providing the "opfs-sahpool" VFS instead
- Allow passing in a custom path for the WASM module in order to support
  cache-busting filenames / bundlers.

## Usage

TODO

## Developing

### Installing prerequisites

```
pnpm install
```

This will install some tools we use like
[oxfmt](https://oxc.rs/docs/guide/usage/formatter.html).

### Fetching the SQLite source code

Ensure `sqlite-revision.txt` contains the desired SQLite version (e.g.
`version-3.51.1` or any tag from the
[SQLite git repository](https://github.com/sqlite/sqlite.git)).

Then run:

```
pnpm run fetch
```

### Applying patches

```
pnpm run patch
```

#### Creating new patches

First [fetch the source](#fetching-the-sqlite-source-code) then apply any
existing patches.

Then go to `work/sqlite-src`, make edits and run
`git diff > ../../patches/patch-name.patch`.

Something like:

```
pnpm run fetch
pnpm run patch
cd work/sqlite-src
vim ext/wasm/api/pre-js.c-pp.js # For example
git diff > ../../patches/000x-patch-description.patch
git stash
cd ../..
git add patches/000x-patch-description.patch
```

### Building the WASM module

#### Getting Emscripten

First you need to [install
Emscripten](https://emscripten.org/docs/getting_started/downloads.html).

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh # Or source ./emsdk_env.fish etc.
```

Note that you need to run the `emsdk_env.*` script every time so you might want
to add something to your shell's startup script.

e.g. for fish

```fish
if test -e ~/emsdk/emsdk_env.fish
    EMSDK_QUIET=1 source ~/emsdk/emsdk_env.fish
end
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
