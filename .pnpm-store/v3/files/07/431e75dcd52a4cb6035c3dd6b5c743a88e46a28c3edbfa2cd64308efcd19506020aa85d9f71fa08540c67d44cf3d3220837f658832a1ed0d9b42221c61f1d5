# rehype-autolink-headings

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin to add links to headings with `id`s back to themselves.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeAutolinkHeadings[, options])`](#unifieduserehypeautolinkheadings-options)
*   [Examples](#examples)
    *   [Example: different behaviors](#example-different-behaviors)
    *   [Example: content](#example-content)
    *   [Example: group](#example-group)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin to add links from headings
back to themselves.
It looks for headings (so `<h1>` through `<h6>`), that have `id` attributes,
and injects a link to themselves.
Similar functionality is applied by many places that render markdown.
For example, when browsing this readme on GitHub or npm, an anchor is added
to headings, which you can share to point people to a particular place in a
document.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**rehype** adds support for HTML to unified.
**hast** is the HTML AST that rehype uses.
This is a rehype plugin that adds links to headings in the AST.

## When should I use this?

This plugin is useful when you have relatively long documents, where you want
users to be able to link to particular sections, and you already have `id`
attributes set on all (or certain?) headings.

A different plugin, [`rehype-slug`][rehype-slug], adds `id`s to headings.
When a heading doesn’t already have an `id` attribute, it creates a slug from
it, and adds that as the `id` attribute.
When using both plugins together, all headings (whether explicitly with a
certain `id` or automatically with a generate one) will get a link back to
themselves.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install rehype-autolink-headings
```

In Deno with [Skypack][]:

```js
import rehypeAutolinkHeadings from 'https://cdn.skypack.dev/rehype-autolink-headings@6?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import rehypeAutolinkHeadings from 'https://cdn.skypack.dev/rehype-autolink-headings@6?min'
</script>
```

## Use

Say we have the following file `example.html`:

```html
<h1 id=some-id>Lorem ipsum</h1>
<h2>Dolor sit amet 😪</h2>
<h3>consectetur &amp; adipisicing</h3>
<h4>elit</h4>
<h5>elit</h5>
```

And our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {rehype} from 'rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

main()

async function main() {
  const file = await rehype()
    .data('settings', {fragment: true})
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .process(await read('example.html'))

  console.log(String(file))
}
```

Now, running `node example.js` yields:

```html
<h1 id="some-id"><a aria-hidden="true" tabindex="-1" href="#some-id"><span class="icon icon-link"></span></a>Lorem ipsum</h1>
<h2 id="dolor-sit-amet-"><a aria-hidden="true" tabindex="-1" href="#dolor-sit-amet-"><span class="icon icon-link"></span></a>Dolor sit amet 😪</h2>
<h3 id="consectetur--adipisicing"><a aria-hidden="true" tabindex="-1" href="#consectetur--adipisicing"><span class="icon icon-link"></span></a>consectetur &#x26; adipisicing</h3>
<h4 id="elit"><a aria-hidden="true" tabindex="-1" href="#elit"><span class="icon icon-link"></span></a>elit</h4>
<h5 id="elit-1"><a aria-hidden="true" tabindex="-1" href="#elit-1"><span class="icon icon-link"></span></a>elit</h5>
```

> 👉 **Note**: observe that from the `<h2>` on, automatic `id`s are generated.
> This is done by `rehype-slug`.
> Without `rehype-slug`, those headings would not be linked.

## API

This package exports no identifiers.
The default export is `rehypeAutolinkHeadings`.

### `unified().use(rehypeAutolinkHeadings[, options])`

Add links to headings with `id`s back to themselves.

> 👉 **Note**: this plugin operates on headings that have `id` attributes.
> You can use `rehype-slug` to automatically generate `id`s for headings.

##### `options`

Configuration (optional).

###### `options.behavior`

How to create links (`string`, default: `'prepend'`).

*   `'prepend'` — inject link before the heading text
*   `'append'` — inject link after the heading text
*   `'wrap'` — wrap the whole heading text with the link
*   `'before'` — insert link before the heading
*   `'after'` — insert link after the heading

> 👉 **Note**: `options.content` is ignored when the behavior is `wrap`,
> `options.group` is ignored when the behavior is `prepend`, `append`, or
> `wrap`.

###### `options.properties`

Attributes to set on the link ([`Properties`][properties], optional).
Defaults to `{ariaHidden: true, tabIndex: -1}` when in `'prepend'` or
`'append'` mode, and `{}` otherwise.

###### `options.content`

**[hast][]** nodes to insert in the link (`Function|Node|Children`).
By default, a `<span class="icon icon-link"></span>` is used.

When a function is given, it’s called with the current heading (`Element`) and
should return one or more nodes.

> 👉 **Note**: this option is ignored when the behavior is `wrap`.

###### `options.group`

**[hast][]** node to wrap the heading and link with (`Function|Node`, optional).
There is no default.

When a function is given, it’s called with the current heading (`Element`) and
should return a hast node.

> 👉 **Note**: this option is ignored when the behavior is `prepend`, `append`,
> or `wrap`

###### `options.test`

Test to define which heading elements are linked.
Any test that can be given to [`hast-util-is-element`][hast-util-is-element] is
supported.
The default (no test) is to link all headings with an `id` attribute.

Can be used to link only `<h1>` through `<h3>` (with `['h1', 'h2', 'h3']`), or
for example all except `<h1>` (with `['h2', 'h3', 'h4', 'h5', 'h6']`).
A function can be given to do more complex things.

## Examples

### Example: different behaviors

This example shows what each behavior generates by default.

```js
import {rehype} from 'rehype'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

main()

async function main() {
  const behaviors = ['prepend', 'append', 'wrap', 'before', 'after']
  let index = -1
  while (++index < behaviors.length) {
    const behavior = behaviors[index]
    console.log(
      String(
        await rehype()
          .data('settings', {fragment: true})
          .use(rehypeAutolinkHeadings, {behavior})
          .process('<h1 id="' + behavior + '">' + behavior + '</h1>')
      )
    )
  }
}
```

Yields:

```html
<h1 id="prepend"><a aria-hidden="true" tabindex="-1" href="#prepend"><span class="icon icon-link"></span></a>prepend</h1>
<h1 id="append">append<a aria-hidden="true" tabindex="-1" href="#append"><span class="icon icon-link"></span></a></h1>
<h1 id="wrap"><a href="#wrap">wrap</a></h1>
<a href="#before"><span class="icon icon-link"></span></a><h1 id="before">before</h1>
<h1 id="after">after</h1><a href="#after"><span class="icon icon-link"></span></a>
```

### Example: content

The following example passes `content` as a function, to generate an accessible
description of each link.

```js
import {rehype} from 'rehype'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import {toString} from 'hast-util-to-string'
import {h} from 'hastscript'

main()

async function main() {
  const file = await rehype()
    .data('settings', {fragment: true})
    .use(rehypeAutolinkHeadings, {
      content(node) {
        return [
          h('span.visually-hidden', 'Read the “', toString(node), '” section'),
          h('span.icon.icon-link', {ariaHidden: 'true'})
        ]
      }
    })
    .process('<h1 id="xxx">xxx</h1>')

  console.log(String(file))
}
```

Yields:

```html
<h1 id="xxx"><a aria-hidden="true" tabindex="-1" href="#xxx"><span class="visually-hidden">Read the “xxx” section</span><span class="icon icon-link" aria-hidden="true"></span></a>xxx</h1>
```

### Example: group

The following example passes `group` as a function, to dynamically generate a
differing element that wraps the heading.

```js
import {rehype} from 'rehype'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import {h} from 'hastscript'

main()

async function main() {
  const file = await rehype()
    .data('settings', {fragment: true})
    .use(rehypeAutolinkHeadings, {
      behavior: 'before',
      group(node) {
        return h('.heading-' + node.tagName.charAt(1) + '-group')
      }
    })
    .process('<h1 id="xxx">xxx</h1>')

  console.log(String(file))
}
```

Yields:

```html
<div class="heading-1-group"><a href="#xxx"><span class="icon icon-link"></span></a><h1 id="xxx">xxx</h1></div>
```

## Types

This package is fully typed with [TypeScript][].
It exports an `Options` type, which specifies the interface of the accepted
options.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `rehype-parse` version 1+, `rehype-stringify` version 1+,
`rehype` version 1+, and `unified` version 4+.

## Security

Use of `rehype-autolink-headings` can open you up to a
[cross-site scripting (XSS)][xss] attack if you pass user provided content in
`properties` or `content`.

Always be wary of user input and use [`rehype-sanitize`][rehype-sanitize].

## Related

*   [`rehype-slug`][rehype-slug]
    — add `id`s to headings
*   [`rehype-highlight`](https://github.com/rehypejs/rehype-highlight)
    — apply syntax highlighting to code blocks
*   [`rehype-toc`](https://github.com/JS-DevTools/rehype-toc)
    — add a table of contents (TOC)

## Contribute

See [`contributing.md`][contributing] in [`rehypejs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/rehypejs/rehype-autolink-headings/workflows/main/badge.svg

[build]: https://github.com/rehypejs/rehype-autolink-headings/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/rehypejs/rehype-autolink-headings.svg

[coverage]: https://codecov.io/github/rehypejs/rehype-autolink-headings

[downloads-badge]: https://img.shields.io/npm/dm/rehype-autolink-headings.svg

[downloads]: https://www.npmjs.com/package/rehype-autolink-headings

[size-badge]: https://img.shields.io/bundlephobia/minzip/rehype-autolink-headings.svg

[size]: https://bundlephobia.com/result?p=rehype-autolink-headings

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/rehypejs/rehype/discussions

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[health]: https://github.com/rehypejs/.github

[contributing]: https://github.com/rehypejs/.github/blob/HEAD/contributing.md

[support]: https://github.com/rehypejs/.github/blob/HEAD/support.md

[coc]: https://github.com/rehypejs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[rehype]: https://github.com/rehypejs/rehype

[hast]: https://github.com/syntax-tree/hast

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[rehype-slug]: https://github.com/rehypejs/rehype-slug

[hast-util-is-element]: https://github.com/syntax-tree/hast-util-is-element

[properties]: https://github.com/syntax-tree/hast#properties
