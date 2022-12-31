# mdast-util-mdxjs-esm

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[mdast][] extensions to parse and serialize [MDX][] ESM import/exports.

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`mdxjsEsmFromMarkdown`](#mdxjsesmfrommarkdown)
    *   [`mdxjsEsmToMarkdown`](#mdxjsesmtomarkdown)
*   [Syntax tree](#syntax-tree)
    *   [Nodes](#nodes)
    *   [Content model](#content-model)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for the ESM syntax enabled
by MDX to [`mdast-util-from-markdown`][mdast-util-from-markdown] and
[`mdast-util-to-markdown`][mdast-util-to-markdown].

## When to use this

These tools are all rather low-level.
In most cases, you’d want to use [`remark-mdx`][remark-mdx] with remark instead.

When you are working with syntax trees and want all of MDX, use
[`mdast-util-mdx`][mdast-util-mdx] instead.

When working with `mdast-util-from-markdown`, you must combine this package with
[`micromark-extension-mdxjs-esm`][extension].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install mdast-util-mdxjs-esm
```

In Deno with [`esm.sh`][esmsh]:

```js
import {mdxjsEsmFromMarkdown, mdxjsEsmToMarkdown} from 'https://esm.sh/mdast-util-mdxjs-esm@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {mdxjsEsmFromMarkdown, mdxjsEsmToMarkdown} from 'https://esm.sh/mdast-util-mdxjs-esm@1?bundle'
</script>
```

## Use

Say our document `example.mdx` contains:

```mdx
import a from 'b'
export const c = ''

d
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import * as acorn from 'acorn'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {mdxjsEsm} from 'micromark-extension-mdxjs-esm'
import {mdxjsEsmFromMarkdown, mdxjsEsmToMarkdown} from 'mdast-util-mdxjs-esm'

const doc = await fs.readFile('example.mdx')

const tree = fromMarkdown(doc, {
  extensions: [mdxjsEsm({acorn, addResult: true})],
  mdastExtensions: [mdxjsEsmFromMarkdown]
})

console.log(tree)

const out = toMarkdown(tree, {extensions: [mdxjsEsmToMarkdown]})

console.log(out)
```

…now running `node example.js` yields (positional info removed for brevity):

```js
{
  type: 'root',
  children: [
    {
      type: 'mdxjsEsm',
      value: "import a from 'b'\nexport const c = ''",
      data: {
        estree: {
          type: 'Program',
          body: [
            {
              type: 'ImportDeclaration',
              specifiers: [
                {
                  type: 'ImportDefaultSpecifier',
                  local: {type: 'Identifier', name: 'a'}
                }
              ],
              source: {type: 'Literal', value: 'b', raw: "'b'"}
            },
            {
              type: 'ExportNamedDeclaration',
              declaration: {
                type: 'VariableDeclaration',
                declarations: [
                  {
                    type: 'VariableDeclarator',
                    id: {type: 'Identifier', name: 'c'},
                    init: {type: 'Literal', value: '', raw: "''"}
                  }
                ],
                kind: 'const'
              },
              specifiers: [],
              source: null
            }
          ],
          sourceType: 'module'
        }
      }
    },
    {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
  ]
}
```

```markdown
import a from 'b'
export const c = ''

d
```

## API

This package exports the identifiers `mdxjsEsmFromMarkdown` and
`mdxjsEsmToMarkdown`.
There is no default export.

### `mdxjsEsmFromMarkdown`

Extension for [`mdast-util-from-markdown`][mdast-util-from-markdown].

When using the [syntax extension with `addResult`][extension], nodes will have
a `data.estree` field set to an [ESTree][].

### `mdxjsEsmToMarkdown`

Extension for [`mdast-util-to-markdown`][mdast-util-to-markdown].

## Syntax tree

The following interfaces are added to **[mdast][]** by this utility.

### Nodes

#### `MDXJSEsm`

```idl
interface MDXJSEsm <: Literal {
  type: "mdxjsEsm"
}
```

**MDXJSEsm** (**[Literal][dfn-literal]**) represents ESM import/exports embedded
in MDX.
It can be used where **[flow][dfn-flow-content]** content is expected.
Its content is represented by its `value` field.

For example, the following Markdown:

```markdown
import a from 'b'
```

Yields:

```js
{
  type: 'mdxjsEsm',
  value: 'import a from \'b\''
}
```

### Content model

#### `FlowContent` (MDX.js ESM)

```idl
type FlowContentMdxjsEsm = MDXJSEsm | FlowContent
```

Note that when ESM is present, it can only exist as top-level content: if it has
a *[parent][dfn-parent]*, that parent must be **[Root][dfn-root]**.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `MdxjsEsm`.

It also registers the node types with `@types/mdast`.
If you’re working with the syntax tree, make sure to import this utility
somewhere in your types, as that registers the new node types in the tree.

```js
/**
 * @typedef {import('mdast-util-mdxjs-esm')}
 */

import {visit} from 'unist-util-visit'

/** @type {import('mdast').Root} */
const tree = getMdastNodeSomeHow()

visit(tree, (node) => {
  // `node` can now be an ESM node.
})
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `mdast-util-from-markdown` version 1+ and
`mdast-util-to-markdown` version 1+.

## Related

*   [`remarkjs/remark-mdx`][remark-mdx]
    — remark plugin to support MDX
*   [`syntax-tree/mdast-util-mdx`][mdast-util-mdx]
    — mdast utility to support MDX
*   [`micromark/micromark-extension-mdxjs-esm`][extension]
    — micromark extension to parse MDX.js ESM

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/mdast-util-mdxjs-esm/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/mdast-util-mdxjs-esm/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/mdast-util-mdxjs-esm.svg

[coverage]: https://codecov.io/github/syntax-tree/mdast-util-mdxjs-esm

[downloads-badge]: https://img.shields.io/npm/dm/mdast-util-mdxjs-esm.svg

[downloads]: https://www.npmjs.com/package/mdast-util-mdxjs-esm

[size-badge]: https://img.shields.io/bundlephobia/minzip/mdast-util-mdxjs-esm.svg

[size]: https://bundlephobia.com/result?p=mdast-util-mdxjs-esm

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

[mdast]: https://github.com/syntax-tree/mdast

[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[mdast-util-to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[mdast-util-mdx]: https://github.com/syntax-tree/mdast-util-mdx

[extension]: https://github.com/micromark/micromark-extension-mdxjs-esm

[estree]: https://github.com/estree/estree

[dfn-literal]: https://github.com/syntax-tree/mdast#literal

[dfn-parent]: https://github.com/syntax-tree/unist#parent-1

[dfn-root]: https://github.com/syntax-tree/mdast#root

[dfn-flow-content]: #flowcontent-mdxjs-esm

[remark-mdx]: https://mdxjs.com/packages/remark-mdx/

[mdx]: https://mdxjs.com
