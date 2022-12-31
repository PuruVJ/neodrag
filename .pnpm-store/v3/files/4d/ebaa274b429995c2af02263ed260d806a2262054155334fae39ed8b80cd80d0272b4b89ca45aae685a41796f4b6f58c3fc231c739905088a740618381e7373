# unist-util-visit-parents

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility to walk the tree with a stack of parents.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`visitParents(tree[, test], visitor[, reverse])`](#visitparentstree-test-visitor-reverse)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This is a very important utility for working with unist as it lets you walk the
tree.

## When should I use this?

You can use this utility when you want to walk the tree and want to know about
every parent of each node.
You can use [`unist-util-visit`][unist-util-visit] if you don’t care about the
entire stack of parents.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, 18.0+), install with [npm][]:

```sh
npm install unist-util-visit-parents
```

In Deno with [`esm.sh`][esmsh]:

```js
import {visitParents} from "https://esm.sh/unist-util-visit-parents@5"
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {visitParents} from "https://esm.sh/unist-util-visit-parents@5?bundle"
</script>
```

## Use

```js
import {visitParents} from 'unist-util-visit-parents'
import {fromMarkdown} from 'mdast-util-from-markdown'

const tree = fromMarkdown('Some *emphasis*, **strong**, and `code`.')

visitParents(tree, 'strong', (node, ancestors) => {
  console.log(node.type, ancestors.map(ancestor => ancestor.type))
})
```

Yields:

```js
strong ['root', 'paragraph']
```

## API

This package exports the identifiers `visitParents`, `SKIP`, `CONTINUE`, and
`EXIT`.
There is no default export.

### `visitParents(tree[, test], visitor[, reverse])`

Walk the `tree` ([`Node`][node]) and visit [*inclusive descendants*][descendant]
with ancestral information.

This algorithm performs *[depth-first][]* *[tree traversal][tree-traversal]* in
*[preorder][]* (**NLR**), or if `reverse` is given, in *reverse preorder*
(**NRL**).

You can choose for which nodes `visitor` is called by passing a `test`.

Walking the tree is an intensive task.
Make use of the return values of the visitor when possible.
Instead of walking a tree multiple times with different `test`s, walk it once
without a test, and use [`unist-util-is`][unist-util-is] to check if a node
matches a test, and then perform different operations.

You can change the tree.
See `visitor` below for more info.

###### Parameters

*   `tree` ([`Node`][node])
    — tree to traverse
*   `test` ([`Test`][test], optional)
    — [`unist-util-is`][unist-util-is]-compatible test
*   `visitor` ([Function][visitor])
    — function called for nodes that pass `test`
*   `reverse` (`boolean`, default: `false`)
    — traverse in reverse preorder (NRL) instead of preorder (NLR) (default

#### `next? = visitor(node, ancestors)`

Called when a node (matching `test`, if given) is entered.

Visitors are free to change `node`.
They can also transform the [parent][] of node (the last of `ancestors`).
Replacing `node` itself is okay if `SKIP` is returned.
When adding or removing previous [sibling][]s (or next siblings, in case of
`reverse`) of `node`, `visitor` must return a new [`index`][index] (`number`)
to specify the sibling to move to after `node` is traversed.
Adding or removing next siblings of `node` (or previous siblings, in case of
`reverse`) is fine without needing to return a new `index`.
Replacing the `children` of a node is fine, but replacing them on an ancestor
is not okay and still causes them to be visited.

###### Parameters

*   `node` ([`Node`][node]) — found node
*   `ancestors` (`Array<Node>`) — [ancestor][]s of `node`

##### Returns

The return value can have the following forms:

*   [`index`][index] (`number`) — like a tuple of `[CONTINUE, index]`
*   `action` (`*`) — like a tuple of `[action]`
*   `tuple` (`[action, index?]`) — array with one or two values, the first an
    `action`, the second and `index`.

> 👉 **Note**: yielding a tuple only makes sense if the `action` is `SKIP`.
> Otherwise, if the `action` is `EXIT`, that action can be returned.
> Or if the `action` is `CONTINUE`, `index` can be returned.

###### `action`

An action can have the following values:

*   `EXIT` (`false`) — stop traversing immediately
*   `CONTINUE` (`true`) — continue traversing as normal
*   `SKIP` (`'skip'`) — do not traverse this node’s children

###### `index`

Next [`index`][index] (`number`).
Defines that the sibling at `index` should be moved to (after `node` itself is
completely traversed).
Useful if mutating the tree, such as removing the node the visitor is currently
on, or any of its previous siblings (or next siblings, in case of `reverse`).
Results less than `0` or greater than or equal to `children.length` stop
traversing the parent

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Test`, `Action`, `Index`, `ActionTuple`,
`VisitorResult`, and `Visitor`.

It also exports the types `BuildVisitor<Tree extends Node = Node, Check extends
Test = string>` to properly type visitors from a tree and a test, and
`Visitor<Visited extends Node = Node, Ancestor extends Parent = Parent>` to
build an arbitrary visitor, from `unist-util-visit-parents/complex-types.d.ts`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`unist-util-visit`](https://github.com/syntax-tree/unist-util-visit)
    — walk the tree with one parent
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

[build-badge]: https://github.com/syntax-tree/unist-util-visit-parents/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-visit-parents/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-visit-parents.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-visit-parents

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-visit-parents.svg

[downloads]: https://www.npmjs.com/package/unist-util-visit-parents

[size-badge]: https://img.shields.io/bundlephobia/minzip/unist-util-visit-parents.svg

[size]: https://bundlephobia.com/result?p=unist-util-visit-parents

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

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[depth-first]: https://github.com/syntax-tree/unist#depth-first-traversal

[tree-traversal]: https://github.com/syntax-tree/unist#tree-traversal

[preorder]: https://github.com/syntax-tree/unist#preorder

[descendant]: https://github.com/syntax-tree/unist#descendant

[parent]: https://github.com/syntax-tree/unist#parent-1

[sibling]: https://github.com/syntax-tree/unist#sibling

[index]: https://github.com/syntax-tree/unist#index

[ancestor]: https://github.com/syntax-tree/unist#ancestor

[unist-util-visit]: https://github.com/syntax-tree/unist-util-visit

[unist-util-is]: https://github.com/syntax-tree/unist-util-is

[test]: https://github.com/syntax-tree/unist-util-is#test

[visitor]: #next--visitornode-ancestors
