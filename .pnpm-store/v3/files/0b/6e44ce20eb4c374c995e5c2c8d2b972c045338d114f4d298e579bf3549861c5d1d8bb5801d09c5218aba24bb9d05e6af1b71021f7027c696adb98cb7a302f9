# micromark-extension-gfm-autolink-literal

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support GitHub flavored markdown (GFM) [literal
autolinks][].

## What is this?

This package is a micromark extension to add support for GFM literal autolinks.

GitHub employs different algorithms to autolink: one at parse time and one at
transform time (similar to how @mentions are done at transform time).
This difference can be observed because character references and escapes are
handled differently.
But also because issues/PRs/comments omit (perhaps by accident?) the second
algorithm for `www.`, `http://`, and `https://` links (but not for email links).

As this is a syntax extension, it focuses on the first algorithm.
The second algorithm is performed by
[`mdast-util-gfm-autolink-literal`][mdast-autolink-literal].
The `html` part of this micromark extension does not operate on an AST and hence
can’t perform the second algorithm.

## When to use this

In many cases, when working with micromark, you’d want to use
[`micromark-extension-gfm`][micromark-extension-gfm] instead, which combines
this package with other GFM features.

When working with syntax trees, you’d want to combine this package with
[`mdast-util-gfm-autolink-literal`][mdast-autolink-literal] (or
[`mdast-util-gfm`][mdast-util-gfm] when using `micromark-extension-gfm`).

These tools are all rather low-level.
In most cases, you’d instead want to use [`remark-gfm`][remark-gfm] with
[remark][].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-autolink-literal
```

In Deno with [Skypack][]:

```js
import {gfmAutolinkLiteral, gfmAutolinkLiteralHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-autolink-literal@1?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {gfmAutolinkLiteral, gfmAutolinkLiteralHtml} from 'https://cdn.skypack.dev/micromark-extension-gfm-autolink-literal@1?min'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {
  gfmAutolinkLiteral,
  gfmAutolinkLiteralHtml
} from 'micromark-extension-gfm-autolink-literal'

const output = micromark('Just a URL: www.example.com.', {
  extensions: [gfmAutolinkLiteral],
  htmlExtensions: [gfmAutolinkLiteralHtml]
})

console.log(output)
```

Yields:

```html
<p>Just a URL: <a href="http://www.example.com">www.example.com</a>.</p>
```

## API

This package exports the following identifiers: `gfmAutolinkLiteral`,
`gfmAutolinkLiteralHtml`.
There is no default export.

The export map supports the endorsed
[`development` condition](https://nodejs.org/api/packages.html#packages_resolving_user_conditions).
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmAutolinkLiteral`

An extension for micromark to parse GFM autolink literals (can be passed in
`extensions`).

### `gfmAutolinkLiteralHtml`

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

*   [`syntax-tree/mdast-util-gfm-autolink-literal`][mdast-autolink-literal]
    — support GFM autolink literals in mdast
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

[build-badge]: https://github.com/micromark/micromark-extension-gfm-autolink-literal/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-autolink-literal/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-autolink-literal.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-autolink-literal

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-autolink-literal.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-autolink-literal

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-autolink-literal.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-autolink-literal

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

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[mdast-autolink-literal]: https://github.com/syntax-tree/mdast-util-gfm-autolink-literal

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[literal autolinks]: https://github.github.com/gfm/#autolinks-extension-
