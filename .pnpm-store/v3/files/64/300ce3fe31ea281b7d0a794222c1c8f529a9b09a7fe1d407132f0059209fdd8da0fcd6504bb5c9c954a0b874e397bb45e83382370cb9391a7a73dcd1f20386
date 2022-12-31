# mdast-util-find-and-replace

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[mdast][] utility to find and replace things.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`findAndReplace(tree, find, replace[, options])`](#findandreplacetree-find-replace-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a utility that lets you find patterns (`string`, `RegExp`) in
text and replace them with nodes.

## When should I use this?

This utility is typically useful when you have regexes and want to modify mdast.
One example is when you have some form of “mentions” (such as
`/@([a-z][_a-z0-9])\b/gi`) and want to create links to persons from them.

A similar package, [`hast-util-find-and-replace`][hast-util-find-and-replace]
does the same but on [hast][].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install mdast-util-find-and-replace
```

In Deno with [`esm.sh`][esmsh]:

```js
import {findAndReplace} from 'https://esm.sh/mdast-util-find-and-replace@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {findAndReplace} from 'https://esm.sh/mdast-util-find-and-replace@2?bundle'
</script>
```

## Use

```js
import {u} from 'unist-builder'
import {inspect} from 'unist-util-inspect'
import {findAndReplace} from 'mdast-util-find-and-replace'

const tree = u('paragraph', [
  u('text', 'Some '),
  u('emphasis', [u('text', 'emphasis')]),
  u('text', ' and '),
  u('strong', [u('text', 'importance')]),
  u('text', '.')
])

findAndReplace(tree, [
  [/and/gi, 'or'],
  [/emphasis/gi, 'em'],
  [/importance/gi, 'strong'],
  [
    /Some/g,
    function ($0) {
      return u('link', {url: '//example.com#' + $0}, [u('text', $0)])
    }
  ]
])

console.log(inspect(tree))
```

Yields:

```txt
paragraph[8]
├─0 link[1]
│   │ url: "//example.com#Some"
│   └─0 text "Some"
├─1 text " "
├─2 emphasis[1]
│   └─0 text "em"
├─3 text " "
├─4 text "or"
├─5 text " "
├─6 strong[1]
│   └─0 text "strong"
└─7 text "."
```

## API

This package exports the identifier `findAndReplace`.
There is no default export.

### `findAndReplace(tree, find, replace[, options])`

Find patterns in a tree and replace them.
The algorithm searches the tree in *[preorder][]* for complete values in
[`Text`][text] nodes.
Partial matches are not supported.

###### Signatures

*   `findAndReplace(tree, find, replace[, options])`
*   `findAndReplace(tree, search[, options])`

###### Parameters

*   `tree` ([`Node`][node])
*   `find` (`string` or `RegExp`)
    — value to find and remove (`string`s are escaped and turned into a global
    `RegExp`)
*   `replace` (`string` or `Function`)
    — value to insert.
    `string`s are turned into a [`Text`][text] node,
    `Function`s are called with the results of calling `RegExp.exec` as
    arguments, and they can return a [`Node`][node], a `string` (which is
    wrapped in a [`Text`][text] node), or `false` to not replace
*   `search` (`Array` or `Object`)
    — perform multiple find-and-replaces.
    Either an `Array` of tuples (`Array`s) with `find` (at `0`) and `replace`
    (at `1`), or an `Object` where each key is `find` and each value is
    the corresponding `replace`
*   `options.ignore` (`Test`, default: `[]`)
    — any [`unist-util-is`][test] compatible test.

###### Returns

The given `tree` ([`Node`][node]).

## Types

This package is fully typed with [TypeScript][].
It exports the types `Find`, `Replace`, `ReplaceFunction`,
`FindAndReplaceTuple`, `FindAndReplaceSchema`, `FindAndReplaceList`,
`RegExpMatchObject`, and `Options`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

Use of `mdast-util-find-and-replace` does not involve [hast][] or user content
so there are no openings for [cross-site scripting (XSS)][xss] attacks.

## Related

*   [`hast-util-find-and-replace`](https://github.com/syntax-tree/hast-util-find-and-replace)
    — find and replace in hast
*   [`hast-util-select`](https://github.com/syntax-tree/hast-util-select)
    — `querySelector`, `querySelectorAll`, and `matches`
*   [`unist-util-select`](https://github.com/syntax-tree/unist-util-select)
    — select unist nodes with CSS-like selectors

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definition -->

[build-badge]: https://github.com/syntax-tree/mdast-util-find-and-replace/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/mdast-util-find-and-replace/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/mdast-util-find-and-replace.svg

[coverage]: https://codecov.io/github/syntax-tree/mdast-util-find-and-replace

[downloads-badge]: https://img.shields.io/npm/dm/mdast-util-find-and-replace.svg

[downloads]: https://www.npmjs.com/package/mdast-util-find-and-replace

[size-badge]: https://img.shields.io/bundlephobia/minzip/mdast-util-find-and-replace.svg

[size]: https://bundlephobia.com/result?p=mdast-util-find-and-replace

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

[hast]: https://github.com/syntax-tree/hast

[mdast]: https://github.com/syntax-tree/mdast

[node]: https://github.com/syntax-tree/mdast#ndoes

[preorder]: https://github.com/syntax-tree/unist#preorder

[text]: https://github.com/syntax-tree/mdast#text

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[test]: https://github.com/syntax-tree/unist-util-is#api

[hast-util-find-and-replace]: https://github.com/syntax-tree/hast-util-find-and-replace
