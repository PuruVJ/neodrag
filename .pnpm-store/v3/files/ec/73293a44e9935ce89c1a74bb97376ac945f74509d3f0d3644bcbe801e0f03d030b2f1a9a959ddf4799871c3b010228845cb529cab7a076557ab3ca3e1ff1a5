# import-meta-resolve

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]

Resolve things like Node.js.

## Contents

*   [What is this?](#what-is-this)
*   [When to use this?](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`resolve(specifier, parent)`](#resolvespecifier-parent)
    *   [`moduleResolve(specifier, parent, conditions, preserveSymlinks)`](#moduleresolvespecifier-parent-conditions-preservesymlinks)
*   [Algorithm](#algorithm)
*   [Differences to Node](#differences-to-node)
*   [Errors](#errors)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a ponyfill for [`import.meta.resolve`][resolve].
It supports everything you need to resolve files just like modern Node does:
import maps, export maps, loading CJS and ESM projects, all of that!

## When to use this?

As of Node.js 19.1, `import.meta.resolve` is still behind an experimental flag.
This package can be used to do what it does in Node 14–18.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install import-meta-resolve
```

## Use

```js
import {resolve} from 'import-meta-resolve'

// A file:
console.log(await resolve('./index.js', import.meta.url))
//=> file:///Users/tilde/Projects/oss/import-meta-resolve/index.js

// A CJS package:
console.log(await resolve('builtins', import.meta.url))
//=> file:///Users/tilde/Projects/oss/import-meta-resolve/node_modules/builtins/index.js

// A scoped CJS package:
console.log(await resolve('@eslint/eslintrc', import.meta.url))
//=> file:///Users/tilde/Projects/oss/import-meta-resolve/node_modules/@eslint/eslintrc/lib/index.js

// A package with an export map:
console.log(await resolve('tape/lib/test', import.meta.url))
//=> file:///Users/tilde/Projects/oss/import-meta-resolve/node_modules/tape/lib/test.js

// A node builtin:
console.log(await resolve('fs', import.meta.url))
//=> node:fs
```

## API

This package exports the identifiers `resolve` and `moduleResolve`.
There is no default export.

### `resolve(specifier, parent)`

Match `import.meta.resolve` except that `parent` is required (you can pass
`import.meta.url`).

###### Parameters

*   `specifier` (`string`)
    — the module specifier to resolve relative to parent
    (`/example.js`, `./example.js`, `../example.js`, `some-package`, `fs`, etc).
*   `parent` (`string`, example: `import.meta.url`)
    — the absolute parent module URL to resolve from.
    You should pass `import.meta.url` or something else.

###### Returns

Returns a promise that resolves to a full `file:`, `data:`, or `node:` URL
(`string`) to the found thing.

### `moduleResolve(specifier, parent, conditions, preserveSymlinks)`

The [“Resolver Algorithm Specification”][algo] as detailed in the Node docs
(which is sync and slightly lower-level than `resolve`).

###### Parameters

*   `specifier` (`string`)
    — `/example.js`, `./example.js`, `../example.js`, `some-package`, `fs`, etc
*   `parent` (`URL`, example: `import.meta.url`)
    — full URL (to a file) that `specifier` is resolved relative from
*   `conditions` (`Set<string>`, default: `new Set(['node', 'import'])`)
    — conditions
*   `preserveSymlinks` (`boolean`, default: `false`)
    — keep symlinks instead of resolving them

###### Returns

A URL object (`URL`) to the found thing.

## Algorithm

The algorithm for `resolve` matches how Node handles `import.meta.resolve`, with
a couple of differences.

The algorithm for `moduleResolve` matches the [Resolver Algorithm
Specification][algo] as detailed in the Node docs (which is sync and slightly
lower-level than `resolve`).

## Differences to Node

*   `parent` defaulting to `import.meta.url` cannot be ponyfilled: you have to
    explicitly pass it
*   no support for CLI flags:
    `--experimental-json-modules`, `--experimental-wasm-modules`,
    `--experimental-policy`, `--experimental-network-imports`, `--no-addons`,
    `--input-type`, `--preserve-symlinks`,
    `--preserve-symlinks-main`, nor `--conditions` work
*   no support for `WATCH_REPORT_DEPENDENCIES` env variable
*   no attempt is made to add a suggestion based on how things used to work in
    CJS before to not-found errors
*   prototypal methods are not guarded: Node protects for example `String#slice`
    or so from being tampered with, whereas this doesn’t

## Errors

*   `ERR_INVALID_MODULE_SPECIFIER`
    — when `specifier` is invalid (example: `'#'`)
*   `ERR_INVALID_PACKAGE_CONFIG`
    — when a `package.json` is invalid (example: invalid JSON)
*   `ERR_INVALID_PACKAGE_TARGET`
    — when a `package.json` `exports` or `imports` is invalid (example: when it
    does not start with `'./'`)
*   `ERR_MODULE_NOT_FOUND`
    — when `specifier` cannot be found in `parent` (example: `'some-missing-package'`)
*   `ERR_NETWORK_IMPORT_DISALLOWED`
    — thrown when trying to resolve a local file or builtin from a remote file
    (`node:fs` relative to `'https://example.com'`)
*   `ERR_PACKAGE_IMPORT_NOT_DEFINED`
    — when a local import is not defined in an import map (example: `'#local'`
    when not defined)
*   `ERR_PACKAGE_PATH_NOT_EXPORTED`
    — when an export is not defined in an export map (example: `'tape/index.js'`,
    which is not in its export map)
*   `ERR_UNSUPPORTED_DIR_IMPORT`
    — when attempting to import a directory (example: `'./lib/'`)
*   `ERR_UNKNOWN_FILE_EXTENSION`
    — when somehow reading a file that has an unexpected extensions (`'./readme.md'`)
*   `ERR_INVALID_ARG_VALUE`
    — when `conditions` is incorrect
*   `ERR_UNSUPPORTED_ESM_URL_SCHEME`
    — when an unexpected protocol is found (`'xss:alert(1)'`)

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `ErrnoException`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/import-meta-resolve/workflows/main/badge.svg

[build]: https://github.com/wooorm/import-meta-resolve/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/import-meta-resolve.svg

[coverage]: https://codecov.io/github/wooorm/import-meta-resolve

[downloads-badge]: https://img.shields.io/npm/dm/import-meta-resolve.svg

[downloads]: https://www.npmjs.com/package/import-meta-resolve

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[algo]: https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_resolver_algorithm

[resolve]: https://nodejs.org/api/esm.html#esm_import_meta_resolve_specifier_parent
