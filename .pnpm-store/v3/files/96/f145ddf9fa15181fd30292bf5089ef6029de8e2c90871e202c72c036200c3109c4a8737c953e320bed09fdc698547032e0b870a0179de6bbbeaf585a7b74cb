# supports-esm

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]
[![License][license-image]][license-url]

Detect at runtime if Node.js supports ECMAScript modules.

## Installation

`$ npm install supports-esm`

## Usage

This library exports `true` if the current Node.js version is considered to have
reasonable support for ESM features, `false` otherwise.

Version 1.x returns `true` if the following features are all present:

- Dynamic imports
- "exports" field in `package.json`, including conditional exports
- Package self-reference

One notable use case is to conditionally execute an ESM or CommonJS entrypoint
from a "bin" script, such as a command-line interface authored in ESM and
transpiled to CommonJS for backwards compatibility:

```js
'use strict';

const supportsESM = require('supports-esm');

if (supportsESM) {
  import('../src/cli.js').catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  require('../build-cjs/cli.js');
}
```

This snippet works in all Node.js versions >= 10.0.0.

[npm-image]: https://img.shields.io/npm/v/supports-esm.svg
[npm-url]: https://npmjs.org/package/supports-esm
[ci-image]: https://github.com/targos/supports-esm/workflows/Test/badge.svg?branch=master
[ci-url]: https://github.com/targos/supports-esm/actions?query=workflow%3ATest
[download-image]: https://img.shields.io/npm/dm/supports-esm.svg
[download-url]: https://npmjs.org/package/supports-esm
[license-image]: https://img.shields.io/npm/l/supports-esm.svg
[license-url]: LICENSE
