# unist-util-position-from-estree

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**unist**][unist] utility to get a position from an [**estree**][estree] node.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install unist-util-position-from-estree
```

## Use

```js
import {parse} from 'acorn'
import {positionFromEstree} from 'unist-util-position-from-estree'

// Make acorn support line/column.
const node = parse('function x() { console.log(1) }', {
  ecmaVersion: 2020,
  locations: true
})

console.log(positionFromEstree(node)) // `Program`
console.log(positionFromEstree(node.body[0].id)) // `x`
console.log(positionFromEstree(node.body[0].body.body[0].expression)) // Call
```

Yields:

```js
{
  start: {line: 1, column: 1, offset: 0},
  end: {line: 1, column: 32, offset: 31}
}
{
  start: {line: 1, column: 10, offset: 9},
  end: {line: 1, column: 11, offset: 10}
}
{
  start: {line: 1, column: 16, offset: 15},
  end: {line: 1, column: 30, offset: 29}
}
```

## API

This package exports the following identifiers: `positionFromEstree`.
There is no default export.

### `positionFromEstree(node)`

Given a [`node`][estree], returns a [`position`][position].

## Related

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

[build-badge]: https://github.com/syntax-tree/unist-util-position-from-estree/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-position-from-estree/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-position-from-estree.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-position-from-estree

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-position-from-estree.svg

[downloads]: https://www.npmjs.com/package/unist-util-position-from-estree

[size-badge]: https://img.shields.io/bundlephobia/minzip/unist-util-position-from-estree.svg

[size]: https://bundlephobia.com/result?p=unist-util-position-from-estree

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

[estree]: https://github.com/estree/estree

[unist]: https://github.com/syntax-tree/unist

[position]: https://github.com/syntax-tree/unist#position
