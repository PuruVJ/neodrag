# micromark-extension-gfm-strikethrough

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support GitHub flavored markdown (GFM)
[strikethrough][].

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`gfmStrikethrough(options?)`](#gfmstrikethroughoptions)
    *   [`gfmStrikethroughHtml`](#gfmstrikethroughhtml)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a micromark extension to add support for GFM strikethrough.
Strikethrough on `github.com`, which this extension matches, can use one
(`~one~`) or two (`~~two~~`) tildes.
You can also strictly match the GFM spec instead of their implementation by
passing `singleTilde: false`.

## When to use this

In many cases, when working with micromark, you’d want to use
[`micromark-extension-gfm`][micromark-extension-gfm] instead, which combines
this package with other GFM features.

When working with syntax trees, you’d want to combine this package with
[`mdast-util-gfm-strikethrough`][mdast-util-gfm-strikethrough] (or
[`mdast-util-gfm`][mdast-util-gfm] when using `micromark-extension-gfm`).

These tools are all rather low-level.
In most cases, you’d instead want to use [`remark-gfm`][remark-gfm] with
[remark][].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-strikethrough
```

In Deno with [Skypack][]:

```js
import {gfmStrikethrough, gfmStrikethroughHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-strikethrough@1?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {gfmStrikethrough, gfmStrikethroughHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-strikethrough@1?min'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {
  gfmStrikethrough,
  gfmStrikethroughHtml
} from 'micromark-extension-gfm-strikethrough'

const output = micromark('Some ~strikethrough~.', {
  extensions: [gfmStrikethrough()],
  htmlExtensions: [gfmStrikethroughHtml]
})

console.log(output)
```

Yields:

```html
<p>Some <del>strikethrough</del></p>.
```

## API

This package exports the following identifiers: `gfmStrikethrough`,
`gfmStrikethroughHtml`.
There is no default export.

The export map supports the endorsed
[`development` condition](https://nodejs.org/api/packages.html#packages_resolving_user_conditions).
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmStrikethrough(options?)`

A function that can be called to get an extension for micromark to parse
GFM strikethrough (can be passed in `extensions`).

##### `options`

Configuration (optional).

###### `options.singleTilde`

Whether to support strikethrough with a single tilde (`boolean`, default:
`true`).
Single tildes work on github.com, but are technically prohibited by GFM.

### `gfmStrikethroughHtml`

An extension to compile them to HTML (can be passed in `htmlExtensions`).

## Types

This package is fully typed with [TypeScript][].
It exports additional `Options` type that models its respective interface.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Related

*   [`syntax-tree/mdast-util-gfm-strikethrough`][mdast-util-gfm-strikethrough]
    — support GFM strikethrough in mdast
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

[build-badge]: https://github.com/micromark/micromark-extension-gfm-strikethrough/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-strikethrough/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-strikethrough.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-strikethrough

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-strikethrough.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-strikethrough

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-strikethrough.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-strikethrough

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

[mdast-util-gfm-strikethrough]: https://github.com/syntax-tree/mdast-util-gfm-strikethrough

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[strikethrough]: https://github.github.com/gfm/#strikethrough-extension-
