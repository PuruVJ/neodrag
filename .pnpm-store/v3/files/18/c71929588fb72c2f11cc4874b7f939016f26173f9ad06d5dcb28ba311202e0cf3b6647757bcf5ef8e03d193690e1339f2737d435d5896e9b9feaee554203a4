# rehype-stringify

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin to add support for serializing HTML.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeStringify[, options])`](#unifieduserehypestringify-options)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin that defines how to take a
syntax tree as input and turn it into serialized HTML.
When it’s used, HTML is serialized as the final result.

See [the monorepo readme][rehype] for info on what the rehype ecosystem is.

## When should I use this?

This plugin adds support to unified for serializing HTML.
You can alternatively use [`rehype`][rehype-core] instead, which combines
unified, [`rehype-parse`][rehype-parse], and this plugin.

When you’re in a browser, trust your content, don’t need formatting options, and
value a smaller bundle size, you can use
[`rehype-dom-stringify`][rehype-dom-stringify] instead.

This plugin is built on [`hast-util-to-html`][hast-util-to-html], which turns
[hast][] syntax trees into a string.
rehype focusses on making it easier to transform content by abstracting such
internals away.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install rehype-stringify
```

In Deno with [Skypack][]:

```js
import rehypeStringify from 'https://cdn.skypack.dev/rehype-stringify@9?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import rehypeStringify from 'https://cdn.skypack.dev/rehype-stringify@9?min'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

main()

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process('# Hi\n\n*Hello*, world!')

  console.log(String(file))
}
```

…running that with `node example.js` yields:

```html
<h1>Hi</h1>
<p><em>Hello</em>, world!</p>
```

## API

This package exports no identifiers.
The default export is `rehypeStringify`.

### `unified().use(rehypeStringify[, options])`

Add support for serializing HTML.
Options are passed to [`hast-util-to-html`][hast-util-to-html].

##### `options`

Configuration (optional).

###### `options.entities`

Define how to create character references (`Object`, default: `{}`).
Configuration is passed to [`stringify-entities`][stringify-entities].
You can use the fields `useNamedReferences`, `useShortestReferences`, and
`omitOptionalSemicolons`.
You cannot use the fields `escapeOnly`, `attribute`, or `subset`).

###### `options.upperDoctype`

Use a `<!DOCTYPE…` instead of `<!doctype…`.
Useless except for XHTML (`boolean`, default: `false`).

###### `options.quote`

Preferred quote to use (`'"'` or `'\''`, default: `'"'`).

###### `options.quoteSmart`

Use the other quote if that results in less bytes (`boolean`, default: `false`).

###### `options.preferUnquoted`

Leave attributes unquoted if that results in less bytes (`boolean`, default:
`false`).

Not used in the SVG space.

###### `options.omitOptionalTags`

Omit optional opening and closing tags (`boolean`, default: `false`).
For example, in `<ol><li>one</li><li>two</li></ol>`, both `</li>` closing tags
can be omitted.
The first because it’s followed by another `li`, the last because it’s followed
by nothing.

Not used in the SVG space.

###### `options.collapseEmptyAttributes`

Collapse empty attributes: get `class` instead of `class=""` (`boolean`,
default: `false`).

Not used in the SVG space.

> 👉 **Note**: boolean attributes (such as `hidden`) are always collapsed.

###### `options.closeSelfClosing`

Close self-closing nodes with an extra slash (`/`): `<img />` instead of
`<img>` (`boolean`, default: `false`).
See `tightSelfClosing` to control whether a space is used before the slash.

Not used in the SVG space.

###### `options.closeEmptyElements`

Close SVG elements without any content with slash (`/`) on the opening tag
instead of an end tag: `<circle />` instead of `<circle></circle>` (`boolean`,
default: `false`).
See `tightSelfClosing` to control whether a space is used before the slash.

Not used in the HTML space.

###### `options.tightSelfClosing`

Do not use an extra space when closing self-closing elements: `<img/>` instead
of `<img />` (`boolean`, default: `false`).

> 👉 **Note**: only used if `closeSelfClosing: true` or
> `closeEmptyElements: true`.

###### `options.tightCommaSeparatedLists`

Join known comma-separated attribute values with just a comma (`,`), instead of
padding them on the right as well (`,␠`, where `␠` represents a space)
(`boolean`, default: `false`).

###### `options.tightAttributes`

Join attributes together, without whitespace, if possible: get
`class="a b"title="c d"` instead of `class="a b" title="c d"` to save bytes
(`boolean`, default: `false`).

Not used in the SVG space.

> 👉 **Note**: intentionally creates parse errors in markup (how parse errors
> are handled is well defined, so this works but isn’t pretty).

###### `options.tightDoctype`

Drop unneeded spaces in doctypes: `<!doctypehtml>` instead of `<!doctype html>`
to save bytes (`boolean`, default: `false`).

> 👉 **Note**: intentionally creates parse errors in markup (how parse errors
> are handled is well defined, so this works but isn’t pretty).

###### `options.bogusComments`

Use “bogus comments” instead of comments to save byes: `<?charlie>` instead of
`<!--charlie-->` (`boolean`, default: `false`).

> 👉 **Note**: intentionally creates parse errors in markup (how parse errors
> are handled is well defined, so this works but isn’t pretty).

###### `options.allowParseErrors`

Do not encode characters which cause parse errors (even though they work), to
save bytes (`boolean`, default: `false`).

Not used in the SVG space.

> 👉 **Note**: intentionally creates parse errors in markup (how parse errors
> are handled is well defined, so this works but isn’t pretty).

###### `options.allowDangerousCharacters`

Do not encode some characters which cause XSS vulnerabilities in older browsers
(`boolean`, default: `false`).

> ⚠️ **Danger**: only set this if you completely trust the content.

###### `options.allowDangerousHtml`

Allow `raw` nodes and insert them as raw HTML.
When falsey, encodes `raw` nodes (`boolean`, default: `false`).

> ⚠️ **Danger**: only set this if you completely trust the content.

###### `options.space`

Which space the document is in (`'svg'` or `'html'`, default: `'html'`).

When an `<svg>` element is found in the HTML space, `rehype-stringify` already
automatically switches to and from the SVG space when entering and exiting it.

> 👉 **Note**: rehype is not an XML parser.
> It supports SVG as embedded in HTML.
> It does not support the features available in XML.
> Passing SVG files might break but fragments of modern SVG should be fine.

###### `options.voids`

Tag names of elements to serialize without closing tag (`Array<string>`,
default: [`html-void-elements`][html-void-elements]).

Not used in the SVG space.

> 👉 **Note**: It’s highly unlikely that you want to pass this.
> It’s only really applicable to the `hast-util-to-html` utility.

## Syntax

HTML is parsed according to WHATWG HTML (the living standard), which is also
followed by browsers such as Chrome and Firefox.

## Syntax tree

The syntax tree format used in rehype is [hast][].

## Types

This package is fully typed with [TypeScript][].
The extra types `Options` are exported.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Security

As **rehype** works on HTML, and improper use of HTML can open you up to a
[cross-site scripting (XSS)][xss] attack, use of rehype can also be unsafe.
Use [`rehype-sanitize`][rehype-sanitize] to make the tree safe.

Use of rehype plugins could also open you up to other attacks.
Carefully assess each plugin and the risks involved in using them.

For info on how to submit a report, see our [security policy][security].

## Contribute

See [`contributing.md`][contributing] in [`rehypejs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## Sponsor

Support this effort and give back by sponsoring on [OpenCollective][collective]!

<!--lint ignore no-html-->

<table>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://vercel.com">Vercel</a><br><br>
  <a href="https://vercel.com"><img src="https://avatars1.githubusercontent.com/u/14985020?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://motif.land">Motif</a><br><br>
  <a href="https://motif.land"><img src="https://avatars1.githubusercontent.com/u/74457950?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.hashicorp.com">HashiCorp</a><br><br>
  <a href="https://www.hashicorp.com"><img src="https://avatars1.githubusercontent.com/u/761456?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gitbook.com">GitBook</a><br><br>
  <a href="https://www.gitbook.com"><img src="https://avatars1.githubusercontent.com/u/7111340?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gatsbyjs.org">Gatsby</a><br><br>
  <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=256&v=4" width="128"></a>
</td>
</tr>
<tr valign="middle">
</tr>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.netlify.com">Netlify</a><br><br>
  <!--OC has a sharper image-->
  <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/256.png" width="128"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.coinbase.com">Coinbase</a><br><br>
  <a href="https://www.coinbase.com"><img src="https://avatars1.githubusercontent.com/u/1885080?s=256&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://themeisle.com">ThemeIsle</a><br><br>
  <a href="https://themeisle.com"><img src="https://avatars1.githubusercontent.com/u/58979018?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://expo.io">Expo</a><br><br>
  <a href="https://expo.io"><img src="https://avatars1.githubusercontent.com/u/12504344?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://boostnote.io">Boost Note</a><br><br>
  <a href="https://boostnote.io"><img src="https://images.opencollective.com/boosthub/6318083/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
<td width="10%"></td>
<td width="10%"></td>
<td width="10%"></td>
</tr>
<tr valign="middle">
<td width="100%" align="center" colspan="8">
  <br>
  <a href="https://opencollective.com/unified"><strong>You?</strong></a>
  <br><br>
</td>
</tr>
</table>

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/rehypejs/rehype/workflows/main/badge.svg

[build]: https://github.com/rehypejs/rehype/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/rehypejs/rehype.svg

[coverage]: https://codecov.io/github/rehypejs/rehype

[downloads-badge]: https://img.shields.io/npm/dm/rehype-stringify.svg

[downloads]: https://www.npmjs.com/package/rehype-stringify

[size-badge]: https://img.shields.io/bundlephobia/minzip/rehype-stringify.svg

[size]: https://bundlephobia.com/result?p=rehype-stringify

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/rehypejs/rehype/discussions

[health]: https://github.com/rehypejs/.github

[security]: https://github.com/rehypejs/.github/blob/main/security.md

[contributing]: https://github.com/rehypejs/.github/blob/main/contributing.md

[support]: https://github.com/rehypejs/.github/blob/main/support.md

[coc]: https://github.com/rehypejs/.github/blob/main/code-of-conduct.md

[license]: https://github.com/rehypejs/rehype/blob/main/license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[unified]: https://github.com/unifiedjs/unified

[rehype]: https://github.com/rehypejs/rehype

[hast]: https://github.com/syntax-tree/hast

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[typescript]: https://www.typescriptlang.org

[rehype-parse]: ../rehype-parse/

[rehype-core]: ../rehype/

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[rehype-dom-stringify]: https://github.com/rehypejs/rehype-dom/tree/main/packages/rehype-dom-stringify

[hast-util-to-html]: https://github.com/syntax-tree/hast-util-to-html

[stringify-entities]: https://github.com/wooorm/stringify-entities

[html-void-elements]: https://github.com/wooorm/html-void-elements
