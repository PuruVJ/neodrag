# micromark-extension-gfm-tagfilter

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support GitHub flavored markdown (GFM)
[tag filter][].

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`gfmTagfilterHtml`](#gfmtagfilterhtml)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a micromark extension to add support for GFMs “tag filter”.

## When to use this

In many cases, when working with micromark, you’d want to use
[`micromark-extension-gfm`][micromark-extension-gfm] instead, which combines
this package with other GFM features.

This package exists for completeness
The tag filter is a naïve attempt at XSS protection.
You should use a proper HTML sanitizing algorithm.

When working with syntax trees ([mdast][]) or [remark][], use
[`rehype-sanitize`][rehype-sanitize] instead.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-tagfilter
```

In Deno with [Skypack][]:

```js
import {gfmTagfilterHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-tagfilter@1?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {gfmTagfilterHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-tagfilter@1?min'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {gfmTagfilterHtml} from 'micromark-extension-gfm-tagfilter'

const output = micromark('XSS! <script>alert(1)</script>', {
  allowDangerousHtml: true,
  htmlExtensions: [gfmTagfilterHtml]
})

console.log(output)
```

Yields:

```html
<p>XSS! &lt;script>alert(1)&lt;/script></p>
```

## API

This package exports the following identifier: `gfmTagfilterHtml`.
There is no default export.

### `gfmTagfilterHtml`

An extension to filter some HTML (script, plaintext, etc.) out when compiling
HTML (can be passed in `htmlExtensions`).

## Types

This package is fully typed with [TypeScript][].
There are no additional exported types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

While micromark is safe by default, this extension only does something when
`allowDangerousHtml: true` is passed, which is an unsafe option.
This package is **not safe**.

## Related

*   [`syntax-tree/mdast-util-gfm`][mdast-util-gfm]
    — support GFM in mdast
*   [`remarkjs/remark-gfm`][remark-gfm]
    — support GFM in remark
*   [`rehypejs/rehype-sanitize`][rehype-sanitize]
    — sanitize HTML in rehype

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

[build-badge]: https://github.com/micromark/micromark-extension-gfm-tagfilter/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-tagfilter/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-tagfilter.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-tagfilter

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-tagfilter.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-tagfilter

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-tagfilter.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-tagfilter

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[micromark]: https://github.com/micromark/micromark

[remark]: https://github.com/remarkjs/remark

[mdast]: https://github.com/syntax-tree/mdast

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[tag filter]: https://github.github.com/gfm/#disallowed-raw-html-extension-
