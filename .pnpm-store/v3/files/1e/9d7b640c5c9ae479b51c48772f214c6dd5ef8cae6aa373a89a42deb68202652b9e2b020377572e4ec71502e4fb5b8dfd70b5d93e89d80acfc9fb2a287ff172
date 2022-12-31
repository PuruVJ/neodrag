# rehype

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[unified][]** processor with support for parsing HTML input and serializing
HTML as output.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`rehype()`](#rehype-1)
*   [Examples](#examples)
    *   [Example: passing options to `rehype-parse`, `rehype-stringify`](#example-passing-options-to-rehype-parse-rehype-stringify)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [License](#license)

## What is this?

This package is a [unified][] processor with support for parsing HTML input
and serializing HTML as output by using unified with
[`rehype-parse`][rehype-parse] and [`rehype-stringify`][rehype-stringify].

See [the monorepo readme][rehype] for info on what the rehype ecosystem is.

## When should I use this?

You can use this package when you want to use unified, have HTML as input, and
want HTML as output.
This package is a shortcut for
`unified().use(rehypeParse).use(rehypeStringify)`.
When the input isn’t HTML (meaning you don’t need `rehype-parse`) or the
output is not HTML (you don’t need `rehype-stringify`), it’s recommended to
use `unified` directly.

When you’re in a browser, trust your content, don’t need positional info on
nodes or formatting options, and value a smaller bundle size, you can use
[`rehype-dom`][rehype-dom] instead.

When you want to inspect and format HTML files in a project on the command
line, you can use [`rehype-cli`][rehype-cli].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install rehype
```

In Deno with [Skypack][]:

```js
import {rehype} from 'https://cdn.skypack.dev/rehype@12?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {rehype} from 'https://cdn.skypack.dev/rehype@12?min'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import {rehype} from 'rehype'
import rehypeFormat from 'rehype-format'

main()

async function main() {
  const file = await rehype()
    .use(rehypeFormat)
    .process(`<!doctype html>
        <html lang=en>
<head>
    <title>Hi!</title>
  </head>
  <body>
    <h1>Hello!</h1>

</body></html>`)

  console.error(String(file))
}
```

…running that with `node example.js` yields:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Hi!</title>
  </head>
  <body>
    <h1>Hello!</h1>
  </body>
</html>
```

## API

This package exports the following identifier: `rehype`.
There is no default export.

### `rehype()`

Create a new (unfrozen) unified processor that already uses `rehype-parse` and
`rehype-stringify` and you can add more plugins to.
See [`unified`][unified] for more information.

## Examples

### Example: passing options to `rehype-parse`, `rehype-stringify`

When you use `rehype-parse` or `rehype-stringify` manually you can pass options
to `use`.
Because both plugins are already used in `rehype`, that’s not possible.
To define options for them, you can instead pass options to `data`:

```js
import {reporter} from 'vfile-reporter'
import {rehype} from 'rehype'

main()

async function main() {
  const file = await rehype()
    .data('settings', {fragment: true, emitParseErrors: true, preferUnquoted: true})
    .process('<div title="a" title="b"></div>')

  console.error(reporter(file))
  console.log(String(file))
}
```

…yields:

```txt
  1:21-1:21  warning  Unexpected duplicate attribute  duplicate-attribute  parse-error

⚠ 1 warning
```

```html
<div title=a></div>
```

## Syntax

HTML is parsed according to WHATWG HTML (the living standard), which is also
followed by browsers such as Chrome and Firefox.

## Syntax tree

The syntax tree format used in rehype is [hast][].

## Types

This package is fully typed with [TypeScript][].
There are no extra types exported.

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

[downloads-badge]: https://img.shields.io/npm/dm/rehype.svg

[downloads]: https://www.npmjs.com/package/rehype

[size-badge]: https://img.shields.io/bundlephobia/minzip/rehype.svg

[size]: https://bundlephobia.com/result?p=rehype

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

[rehype-stringify]: ../rehype-stringify/

[rehype-cli]: ../rehype-cli/

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[rehype-dom]: https://github.com/rehypejs/rehype-dom/tree/main/packages/rehype-dom
