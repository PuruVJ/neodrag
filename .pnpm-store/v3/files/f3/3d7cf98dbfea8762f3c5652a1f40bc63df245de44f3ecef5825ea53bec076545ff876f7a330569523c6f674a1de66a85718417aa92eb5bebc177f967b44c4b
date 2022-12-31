# hast-util-heading-rank

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**hast**][hast] utility to get the rank (or depth, level) of headings.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install hast-util-heading-rank
```

## Use

```js
var h = require('hastscript')
var rank = require('hast-util-heading-rank')

rank(h('p', 'Alpha')) //=> null
rank(h('h5', 'Alpha')) //=> 5
```

## API

This package exports the following identifiers: `headingRank`.
There is no default export.

### `headingRank(node)`

Get the rank (`1` to `6`) of headings (`h1` to `h6`).

###### Parameters

*   `node` ([`Node`][node]) — Node to check

###### Returns

`rank` (`number?`) — Rank of the heading, or `null` if not a heading.

## Security

`hast-util-heading-rank` does not mutate.
There are no openings for [cross-site scripting (XSS)][xss] attacks.

## Related

*   [`hast-util-heading`](https://github.com/syntax-tree/hast-util-heading)
    — check if a node is a heading element
*   [`hast-util-shift-heading`](https://github.com/syntax-tree/hast-util-heading)
    — utility to change heading rank

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://github.com/syntax-tree/hast-util-heading-rank/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hast-util-heading-rank/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-heading-rank.svg

[coverage]: https://codecov.io/github/syntax-tree/hast-util-heading-rank

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-heading-rank.svg

[downloads]: https://www.npmjs.com/package/hast-util-heading-rank

[size-badge]: https://img.shields.io/bundlephobia/minzip/hast-util-heading-rank.svg

[size]: https://bundlephobia.com/result?p=hast-util-heading-rank

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[node]: https://github.com/syntax-tree/hast#nodes

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting
