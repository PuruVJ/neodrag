# hast-util-to-estree

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to transform to [estree][] (JSX).

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`toEstree(tree, options?)`](#toestreetree-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a utility that takes a [hast][] (HTML) syntax tree as input and
turns it into an [estree][] (JavaScript) syntax tree JSX extension.
This package also supports embedded MDX nodes.

## When should I use this?

This project is useful when you want to embed HTML as JSX inside JS while
working with syntax trees.
This us used in [MDX][].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, 18.0+), install with [npm][]:

```sh
npm install hast-util-to-estree
```

In Deno with [`esm.sh`][esmsh]:

```js
import {toEstree} from 'https://esm.sh/hast-util-to-estree@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {toEstree} from 'https://esm.sh/hast-util-to-estree@2?bundle'
</script>
```

## Use

Say our module `example.html` contains:

```html
<!doctype html>
<html lang=en>
<title>Hi!</title>
<link rel=stylesheet href=index.css>
<h1>Hello, world!</h1>
<a download style="width:1;height:10px"></a>
<!--commentz-->
<svg xmlns="http://www.w3.org/2000/svg">
  <title>SVG `&lt;ellipse&gt;` element</title>
  <ellipse
    cx="120"
    cy="70"
    rx="100"
    ry="50"
  />
</svg>
<script src="index.js"></script>
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {fromHtml} from 'hast-util-from-html'
import {toEstree} from 'hast-util-to-estree'
import {toJs, jsx} from 'estree-util-to-js'

const hast = fromHtml(await fs.readFile('example.html'))

const estree = toEstree(hast)

console.log(toJs(estree, {handlers: jsx}).value)
```

…now running `node example.js` (and prettier) yields:

```jsx
/* Commentz */
;<>
  <html lang="en">
    <head>
      <title>{'Hi!'}</title>
      {'\n'}
      <link rel="stylesheet" href="index.css" />
      {'\n'}
    </head>
    <body>
      <h1>{'Hello, world!'}</h1>
      {'\n'}
      <a
        download
        style={{
          width: '1',
          height: '10px'
        }}
      />
      {'\n'}
      {}
      {'\n'}
      <svg xmlns="http://www.w3.org/2000/svg">
        {'\n  '}
        <title>{'SVG `<ellipse>` element'}</title>
        {'\n  '}
        <ellipse cx="120" cy="70" rx="100" ry="50" />
        {'\n'}
      </svg>
      {'\n'}
      <script src="index.js" />
      {'\n'}
    </body>
  </html>
</>
```

## API

This package exports the identifier `toEstree`.
There is no default export.

### `toEstree(tree, options?)`

Transform to [estree][] (JSX).

##### `options`

Configuration (optional).

##### `options.space`

Whether `tree` is in the HTML or SVG space (enum, `'svg'` or `'html'`, default:
`'html'`).
If an `svg` element is found when inside the HTML space, `toEstree`
automatically switches to the SVG space when entering the element, and
switches back when exiting

###### `options.handlers`

Object mapping node types to functions handling the corresponding nodes.
See the code for examples.

###### Returns

Node ([`Program`][program]) whose last child in `body` is most likely an
`ExpressionStatement`, whose expression is a `JSXFragment` or a `JSXElement`.

Typically, there is only one node in `body`, however, this utility also supports
embedded MDX nodes in the HTML (when [`mdast-util-mdx`][mdast-util-mdx] is used
with mdast to parse markdown before passing its nodes through to hast).
When MDX ESM import/exports are used, those nodes are added before the fragment
or element in body.

###### Note

Comments are both attached to the tree in their neighbouring nodes (recast and
babel style), and added as a `comments` array on the program node (espree
style).
You may have to do `program.comments = null` for certain compilers.

There aren’t many great estree serializers out there that support JSX.
To do that, you can use [`estree-util-to-js`][estree-util-to-js].
Or, use [`estree-util-build-jsx`][build-jsx] to turn JSX into function
calls, and then serialize with whatever (astring, escodegen).

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Options`, `Space`, and `Handle`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

You’re working with JavaScript.
It’s not safe.

## Related

*   [`hastscript`][hastscript]
    — hyperscript compatible interface for creating nodes
*   [`hast-util-from-dom`](https://github.com/syntax-tree/hast-util-from-dom)
    — transform a DOM tree to hast
*   [`estree-util-build-jsx`][build-jsx]
    — transform JSX to function calls

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

[build-badge]: https://github.com/syntax-tree/hast-util-to-estree/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hast-util-to-estree/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-to-estree.svg

[coverage]: https://codecov.io/github/syntax-tree/hast-util-to-estree

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-to-estree.svg

[downloads]: https://www.npmjs.com/package/hast-util-to-estree

[size-badge]: https://img.shields.io/bundlephobia/minzip/hast-util-to-estree.svg

[size]: https://bundlephobia.com/result?p=hast-util-to-estree

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

[hastscript]: https://github.com/syntax-tree/hastscript

[hast]: https://github.com/syntax-tree/hast

[estree]: https://github.com/estree/estree

[program]: https://github.com/estree/estree/blob/master/es5.md#programs

[estree-util-to-js]: https://github.com/syntax-tree/estree-util-to-js

[mdast-util-mdx]: https://github.com/syntax-tree/mdast-util-mdx

[build-jsx]: https://github.com/wooorm/estree-util-build-jsx

[mdx]: https://mdxjs.com
