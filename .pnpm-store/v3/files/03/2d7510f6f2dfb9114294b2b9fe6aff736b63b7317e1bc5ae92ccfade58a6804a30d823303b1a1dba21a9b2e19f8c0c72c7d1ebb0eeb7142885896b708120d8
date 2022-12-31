# micromark-extension-gfm-table

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support GitHub flavored markdown (GFM)
[tables][].

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`gfmTable`](#gfmtable)
    *   [`gfmTableHtml`](#gfmtablehtml)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a micromark extension to add support for GFM tables.
It matches how tables work on `github.com`.

## When to use this

In many cases, when working with micromark, you’d want to use
[`micromark-extension-gfm`][micromark-extension-gfm] instead, which combines
this package with other GFM features.

When working with syntax trees, you’d want to combine this package with
[`mdast-util-gfm-table`][mdast-util-gfm-table] (or
[`mdast-util-gfm`][mdast-util-gfm] when using `micromark-extension-gfm`).

These tools are all rather low-level.
In most cases, you’d instead want to use [`remark-gfm`][remark-gfm] with
[remark][].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-table
```

In Deno with [Skypack][]:

```js
import {gfmTable, gfmTableHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-table@1?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {gfmTable, gfmTableHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-table@1?min'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {gfmTable, gfmTableHtml} from 'micromark-extension-gfm-table'

const output = micromark('| a |\n| - |', {
  extensions: [gfmTable],
  htmlExtensions: [gfmTableHtml]
})

console.log(output)
```

Yields:

```html
<table>
<thead>
<tr>
<th>a</th>
</tr>
</thead>
</table>
```

## API

This package exports the following identifiers: `gfmTable`, `gfmTableHtml`.
There is no default export.

The export map supports the endorsed
[`development` condition](https://nodejs.org/api/packages.html#packages_resolving_user_conditions).
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmTable`

An extension for micromark to parse GFM tables (can be passed in `extensions`).

### `gfmTableHtml`

An extension to compile them to HTML (can be passed in `htmlExtensions`).

## Types

This package is fully typed with [TypeScript][].
There are no additional exported types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`syntax-tree/mdast-util-gfm-table`][mdast-util-gfm-table]
    — support GFM tables in mdast
*   [`syntax-tree/mdast-util-gfm`][mdast-util-gfm]
    — support GFM in mdast
*   [`remarkjs/remark-gfm`][remark-gfm]
    — support GFM in remark

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-gfm-table/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-table/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-table.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-table

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-table.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-table

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-table.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-table

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/main/contributing.md

[support]: https://github.com/micromark/.github/blob/main/support.md

[coc]: https://github.com/micromark/.github/blob/main/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[micromark]: https://github.com/micromark/micromark

[remark]: https://github.com/remarkjs/remark

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[mdast-util-gfm-table]: https://github.com/syntax-tree/mdast-util-gfm-table

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[tables]: https://github.github.com/gfm/#tables-extension-
