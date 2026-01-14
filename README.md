# @birchill/nice-sqlite-wasm

This is a custom build of SQLite that only supports the "opfs-sahpool" VFS.
It's "nice" because:

- It remove the "opfs" VFS and worker parts of the JS bindings making for a
  smaller bundle size.
- It allows passing in a custom path for the WASM module in order to support
  cache-busting filenames / bundlers.
- It fixes some warnings that otherwise might occur at build or run-time
  (e.g. the COOP/COEP header warning which is only relevant to the "opfs" VFS
  and a warning about dependencies based on expressions).

In general, it should be nicer for apps using bundlers that only need the
"opfs-sahpool" VFS.

> [!NOTE]
> The JS/WASM part of SQLite is under heavy development and is expected to
> change a lot in future (e.g. using WASI instead of Emscripten). As a result
> this project may no longer be necessary or may become impractical to update.

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
git commit -am "Existing patches"
vim ext/wasm/api/pre-js.c-pp.js # For example
git diff > ../../patches/000x-patch-description.patch
git stash
cd ../..
git add patches/000x-patch-description.patch
```

Then update the table below.

#### Current patches

| Patch name                               | Purpose                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `0001-locatefile-nullish-coalesce.patch` | Allow a user-provided `locateFile` function to be used (rather than clobbered).                                                             |
| `0002-hardcode-locatefile-path.patch`    | Hardcodes the path used in the default `locateFile` implementation so that bundlers don't complain about dependencies based on expressions. |

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
