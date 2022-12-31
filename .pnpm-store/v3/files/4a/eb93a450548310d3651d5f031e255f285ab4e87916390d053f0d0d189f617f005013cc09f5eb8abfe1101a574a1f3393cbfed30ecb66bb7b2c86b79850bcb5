# hastscript

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to create trees with ease.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`h(selector?[, properties][, …children])`](#hselector-properties-children)
    *   [`s(selector?[, properties][, …children])`](#sselector-properties-children)
*   [JSX](#jsx)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a hyperscript interface (like `createElement` from React and
`h` from Vue and such) to help with creating hast trees.

## When should I use this?

You can use this utility in your project when you generate hast syntax trees
with code.
It helps because it replaces most of the repetition otherwise needed in a syntax
tree with function calls.
It also helps as it improves the attributes you pass by turning them into the
form that is required by hast.

You can instead use [`unist-builder`][u] when creating any unist nodes and
[`xastscript`][x] when creating xast (XML) nodes.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install hastscript
```

In Deno with [`esm.sh`][esmsh]:

```js
import {h} from 'https://esm.sh/hastscript@7'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {h} from 'https://esm.sh/hastscript@7?bundle'
</script>
```

## Use

```js
import {h, s} from 'hastscript'

console.log(
  h('.foo#some-id', [
    h('span', 'some text'),
    h('input', {type: 'text', value: 'foo'}),
    h('a.alpha', {class: 'bravo charlie', download: 'download'}, [
      'delta',
      'echo'
    ])
  ])
)

console.log(
  s('svg', {xmlns: 'http://www.w3.org/2000/svg', viewbox: '0 0 500 500'}, [
    s('title', 'SVG `<circle>` element'),
    s('circle', {cx: 120, cy: 120, r: 100})
  ])
)
```

Yields:

```js
{
  type: 'element',
  tagName: 'div',
  properties: {className: ['foo'], id: 'some-id'},
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: {},
      children: [{type: 'text', value: 'some text'}]
    },
    {
      type: 'element',
      tagName: 'input',
      properties: {type: 'text', value: 'foo'},
      children: []
    },
    {
      type: 'element',
      tagName: 'a',
      properties: {className: ['alpha', 'bravo', 'charlie'], download: true},
      children: [{type: 'text', value: 'delta'}, {type: 'text', value: 'echo'}]
    }
  ]
}
{
  type: 'element',
  tagName: 'svg',
  properties: {xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 500 500'},
  children: [
    {
      type: 'element',
      tagName: 'title',
      properties: {},
      children: [{type: 'text', value: 'SVG `<circle>` element'}]
    },
    {
      type: 'element',
      tagName: 'circle',
      properties: {cx: 120, cy: 120, r: 100},
      children: []
    }
  ]
}
```

## API

This package exports the identifiers `h` and `s`.
There is no default export.

The export map supports the automatic JSX runtime.
You can pass `hastscript/html` (or `hastscript`) or `hastscript/svg` to your
build tool (TypeScript, Babel, SWC) as with an `importSource` option or similar.

### `h(selector?[, properties][, …children])`

### `s(selector?[, properties][, …children])`

Create virtual [**hast**][hast] [*trees*][tree] for HTML or SVG.

##### Signatures

*   `h(): root`
*   `h(null[, …children]): root`
*   `h(selector[, properties][, …children]): element`

(and the same for `s`).

##### Parameters

###### `selector`

Simple CSS selector (`string`, optional).
Can contain a tag name (`foo`), IDs (`#bar`), and classes (`.baz`).
If the selector is a string but there is no tag name in it, `h` defaults to
build a `div` element, and `s` to a `g` element.
`selector` is parsed by [`hast-util-parse-selector`][parse-selector].
When string, builds an [`Element`][element].
When nullish, builds a [`Root`][root] instead.

###### `properties`

Map of properties (`Record<string, any>`, optional).
Keys should match either the HTML attribute name, or the DOM property name, but
are case-insensitive.
Cannot be given when building a [`Root`][root].

###### `children`

(Lists of) children (`string`, `number`, `Node`, `Array<children>`, optional).
When strings or numbers are encountered, they are mapped to [`Text`][text]
nodes.
If [`Root`][root] nodes are given, their children are used instead.

##### Returns

[`Element`][element] or [`Root`][root].

## JSX

`hastscript` can be used with JSX.
Either use the automatic runtime set to `hastscript/html` (or `hastscript`) or
`hastscript/svg` or import `h` or `s` yourself and define it as the pragma (plus
set the fragment to `null`).

The example above can then be written like so, using inline pragmas, so
that SVG can be used too:

`example-html.jsx`:

```jsx
/** @jsxImportSource hastscript */
console.log(
  <div class="foo" id="some-id">
    <span>some text</span>
    <input type="text" value="foo" />
    <a class="alpha bravo charlie" download>
      deltaecho
    </a>
  </div>
)
```

`example-svg.jsx`:

```jsx
/** @jsxImportSource hastscript/svg */
console.log(
  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 500 500">
    <title>SVG `&lt;circle&gt;` element</title>
    <circle cx={120} cy={120} r={100} />
  </svg>
)
```

> 👉 **Note**: while `h` supports dots (`.`) for classes or number signs (`#`)
> for IDs in `selector`, those are not supported in JSX.

You can use [`estree-util-build-jsx`][build-jsx] to compile JSX away.

For [Babel][], use [`@babel/plugin-transform-react-jsx`][babel-jsx] and either
pass `pragma: 'h'` and `pragmaFrag: 'null'`, or pass `importSource:
'hastscript'`.
This is not perfect as it allows only a single pragma.
Alternatively, Babel also lets you configure this with a comment:

```jsx
/** @jsx s @jsxFrag null */
import {s} from 'hastscript'

console.log(<rect />)
```

This is useful because it allows using *both* `html` and `svg` when used in
different files.

## Types

This package is fully typed with [TypeScript][].
It exports the additional types:

*   `Child` — valid value used as a child
*   `Properties` — valid properties passed to an element
*   `Result` — output of a `h` (or `s`) call

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

Use of `hastscript` can open you up to a [cross-site scripting (XSS)][xss]
attack as values are injected into the syntax tree.
The following example shows how a script is injected that runs when loaded in a
browser.

```js
const tree = h()

tree.children.push(h('script', 'alert(1)'))
```

Yields:

```html
<script>alert(1)</script>
```

The following example shows how an image is injected that fails loading and
therefore runs code in a browser.

```js
const tree = h()

// Somehow someone injected these properties instead of an expected `src` and
// `alt`:
const otherProps = {src: 'x', onError: 'alert(2)'}

tree.children.push(h('img', {src: 'default.png', ...otherProps}))
```

Yields:

```html
<img src="x" onerror="alert(2)">
```

The following example shows how code can run in a browser because someone stored
an object in a database instead of the expected string.

```js
const tree = h()

// Somehow this isn’t the expected `'wooorm'`.
const username = {
  type: 'element',
  tagName: 'script',
  children: [{type: 'text', value: 'alert(3)'}]
}

tree.children.push(h('span.handle', username))
```

Yields:

```html
<span class="handle"><script>alert(3)</script></span>
```

Either do not use user input in `hastscript` or use
[`hast-util-santize`][hast-util-sanitize].

## Related

*   [`unist-builder`](https://github.com/syntax-tree/unist-builder)
    — create unist trees
*   [`xastscript`](https://github.com/syntax-tree/xastscript)
    — create xast trees
*   [`hast-to-hyperscript`](https://github.com/syntax-tree/hast-to-hyperscript)
    — turn hast into React, Preact, Vue, etc
*   [`hast-util-from-dom`](https://github.com/syntax-tree/hast-util-from-dom)
    — turn DOM trees into hast
*   [`hast-util-select`](https://github.com/syntax-tree/hast-util-select)
    — `querySelector`, `querySelectorAll`, and `matches`
*   [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html)
    — turn hast into HTML
*   [`hast-util-to-dom`](https://github.com/syntax-tree/hast-util-to-dom)
    — turn hast into DOM trees

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/hastscript/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hastscript/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hastscript.svg

[coverage]: https://codecov.io/github/syntax-tree/hastscript

[downloads-badge]: https://img.shields.io/npm/dm/hastscript.svg

[downloads]: https://www.npmjs.com/package/hastscript

[size-badge]: https://img.shields.io/bundlephobia/minzip/hastscript.svg

[size]: https://bundlephobia.com/result?p=hastscript

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

[tree]: https://github.com/syntax-tree/unist#tree

[hast]: https://github.com/syntax-tree/hast

[element]: https://github.com/syntax-tree/hast#element

[root]: https://github.com/syntax-tree/xast#root

[text]: https://github.com/syntax-tree/hast#text

[u]: https://github.com/syntax-tree/unist-builder

[x]: https://github.com/syntax-tree/xastscript

[build-jsx]: https://github.com/wooorm/estree-util-build-jsx

[babel]: https://github.com/babel/babel

[babel-jsx]: https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-react-jsx

[parse-selector]: https://github.com/syntax-tree/hast-util-parse-selector

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[hast-util-sanitize]: https://github.com/syntax-tree/hast-util-sanitize
