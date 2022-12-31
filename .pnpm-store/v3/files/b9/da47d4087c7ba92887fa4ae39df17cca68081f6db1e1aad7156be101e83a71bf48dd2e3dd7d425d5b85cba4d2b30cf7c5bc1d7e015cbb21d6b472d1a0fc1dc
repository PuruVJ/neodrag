# unist-util-visit

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility to walk the tree.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`visit(tree[, test], visitor[, reverse])`](#visittree-test-visitor-reverse)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This is a very important utility for working with unist as it lets you walk the
tree.

## When should I use this?

You can use this utility when you want to walk the tree.
You can use [`unist-util-visit-parents`][vp] if you care about the entire stack
of parents.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, 18.0+), install with [npm][]:

```sh
npm install unist-util-visit
```

In Deno with [`esm.sh`][esmsh]:

```js
import {visit} from "https://esm.sh/unist-util-visit@4"
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {visit} from "https://esm.sh/unist-util-visit@4?bundle"
</script>
```

## Use

```js
import {u} from 'unist-builder'
import {visit} from 'unist-util-visit'

const tree = u('tree', [
  u('leaf', '1'),
  u('node', [u('leaf', '2')]),
  u('void'),
  u('leaf', '3')
])

visit(tree, 'leaf', (node) => {
  console.log(node)
})
```

Yields:

```js
{type: 'leaf', value: '1'}
{type: 'leaf', value: '2'}
{type: 'leaf', value: '3'}
```

## API

This package exports the identifiers `visit`, `CONTINUE`, `SKIP`, and `EXIT`.
There is no default export.

### `visit(tree[, test], visitor[, reverse])`

This function works exactly the same as [`unist-util-visit-parents`][vp],
but `visitor` has a different signature.

#### `next? = visitor(node, index, parent)`

Instead of being passed an array of ancestors, `visitor` is called with the
`node`’s [`index`][index] and its [`parent`][parent].

Please see [`unist-util-visit-parents`][vp].

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Test`, `VisitorResult`, and `Visitor`.

It also exports the types `BuildVisitor<Tree extends Node = Node, Check extends
Test = string>` to properly type visitors from a tree and a test, from
`unist-util-visit-parents/complex-types.d.ts`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`unist-util-visit-parents`][vp]
    — walk the tree with a stack of parents
*   [`unist-util-filter`](https://github.com/syntax-tree/unist-util-filter)
    — create a new tree with all nodes that pass a test
*   [`unist-util-map`](https://github.com/syntax-tree/unist-util-map)
    — create a new tree with all nodes mapped by a given function
*   [`unist-util-flatmap`](https://gitlab.com/staltz/unist-util-flatmap)
    — create a new tree by mapping (to an array) with the given function
*   [`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove)
    — remove nodes from a tree that pass a test
*   [`unist-util-select`](https://github.com/syntax-tree/unist-util-select)
    — select nodes with CSS-like selectors

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://github.com/syntax-tree/unist-util-visit/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-visit/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-visit.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-visit

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-visit.svg

[downloads]: https://www.npmjs.com/package/unist-util-visit

[size-badge]: https://img.shields.io/bundlephobia/minzip/unist-util-visit.svg

[size]: https://bundlephobia.com/result?p=unist-util-visit

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[unist]: https://github.com/syntax-tree/unist

[vp]: https://github.com/syntax-tree/unist-util-visit-parents

[index]: https://github.com/syntax-tree/unist#index

[parent]: https://github.com/syntax-tree/unist#parent-1
