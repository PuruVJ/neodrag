# micromark-extension-mdx-md

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to turn some markdown features off for MDX.

This package provides the low-level modules for integrating with the micromark
tokenizer but has no handling of compiling to HTML.

## When to use this

This package is already included in [xdm][] and [`mdx-js/mdx` (next)][mdx-js].

You should probably use [`micromark-extension-mdx`][mdx] or
[`micromark-extension-mdxjs`][mdxjs] instead, which combine this package with
other MDX features.
Alternatively, if you’re using [`micromark`][micromark] or
[`mdast-util-from-markdown`][from-markdown] and you don’t want all of MDX, use
this package.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install micromark-extension-mdx-md
```

## Use

```js
import {micromark} from 'micromark'
import {mdxMd} from 'micromark-extension-mdx-md'

const output = micromark('\ta', {extensions: [mdxMd]})

console.log(output)
```

Yields:

```html
<p>a</p>
```

## API

This package exports the following identifiers: `mdxMd`.
There is no default export.

### `mdxMd`

An extension for micromark to turn some markdown features (HTML, autolinks,
indented code) off (can be passed in `extensions`).

## Related

*   [`micromark/micromark`][micromark]
    — the smallest commonmark-compliant markdown parser that exists
*   [`micromark/micromark-extension-mdx`][mdx]
    — micromark extension to support MDX
*   [`micromark/micromark-extension-mdxjs`][mdxjs]
    — micromark extension to support MDX.js
*   [`syntax-tree/mdast-util-mdx`][mdast-util-mdx]
    — mdast utility to support MDX (or MDX.js)

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

[build-badge]: https://github.com/micromark/micromark-extension-mdx-md/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-mdx-md/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-mdx-md.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-mdx-md

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-mdx-md.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-mdx-md

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-mdx-md.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-mdx-md

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[micromark]: https://github.com/micromark/micromark

[xdm]: https://github.com/wooorm/xdm

[mdx-js]: https://github.com/mdx-js/mdx

[mdx]: https://github.com/micromark/micromark-extension-mdx

[mdxjs]: https://github.com/micromark/micromark-extension-mdxjs

[mdast-util-mdx]: https://github.com/syntax-tree/mdast-util-mdx

[from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown
