# micromark-extension-frontmatter

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support frontmatter (YAML, TOML, etc).

As there is no spec for frontmatter in markdown, this extension follows how YAML
frontmatter works on github.com.
For the HTML part, instead of rendering YAML, it is ignored.
Other types of frontmatter can be parsed, which will by default also work the
same as on github.com.

This package provides the low-level modules for integrating with the micromark
tokenizer and the micromark HTML compiler.

## When to use this

If you’re using [`micromark`][micromark] or
[`mdast-util-from-markdown`][from-markdown], use this package.
Alternatively, if you’re using **[remark][]**, use
[`remark-frontmatter`][remark-frontmatter].

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install micromark-extension-frontmatter
```

## Use

```js
import {micromark} from 'micromark'
import {frontmatter, frontmatterHtml} from 'micromark-extension-frontmatter'

const output = micromark('---\na: b\n---\n# c', {
  extensions: [frontmatter()],
  htmlExtensions: [frontmatterHtml()]
})

console.log(output)
```

Yields:

```html
<h1>c</h1>
```

## API

This package exports the following identifiers: `frontmatter`,
`frontmatterHtml`.
There is no default export.

The export map supports the endorsed
[`development` condition](https://nodejs.org/api/packages.html#packages_resolving_user_conditions).
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `frontmatter(options?)`

### `frontmatterHtml(options?)`

> Note: `syntax` is the default export of this module, `html` is available at
> `micromark-extension-frontmatter/html`.

Support frontmatter (YAML, TOML, and more).

Two functions that can be called with options to get an extension for micromark
to parse frontmatter (can be passed in `extensions`) and one to compile (ignore)
them (can be passed in `htmlExtensions`).

##### `options`

One [`preset`][preset] or [`Matter`][matter], or an array of them, defining all
the supported frontmatters (default: `'yaml'`).

##### `preset`

Either `'yaml'` or `'toml'`:

*   `'yaml'` — [`matter`][matter] defined as `{type: 'yaml', marker: '-'}`
*   `'toml'` — [`matter`][matter] defined as `{type: 'toml', marker: '+'}`

##### `Matter`

An object with a `type` and either a `marker` or a `fence`:

*   `type` (`string`)
    — Type to tokenize as
*   `marker` (`string` or `{open: string, close: string}`)
    — Character used to construct fences.
    By providing an object with `open` and `close` different characters can be
    used for opening and closing fences.
    For example the character `'-'` will result in `'---'` being used as the
    fence
*   `fence` (`string` or `{open: string, close: string}`)
    — String used as the complete fence.
    By providing an object with `open` and `close` different values can be used
    for opening and closing fences.
    This can be used too if fences contain different characters or lengths other
    than 3
*   `anywhere` (`boolean`, default: `false`)
    – if `true`, matter can be found anywhere in the document.
    If `false` (default), only matter at the start of the document is recognized

###### Example

For `{type: 'yaml', marker: '-'}`:

```yaml
---
key: value
---
```

For `{type: 'custom', marker: {open: '<', close: '>'}}`:

```text
<<<
data
>>>
```

For `{type: 'custom', fence: '+=+=+=+'}`:

```text
+=+=+=+
data
+=+=+=+
```

For `{type: 'json', fence: {open: '{', close: '}'}}`:

```json
{
  "key": "value"
}
```

## Related

*   [`remarkjs/remark`][remark]
    — markdown processor powered by plugins
*   [`remarkjs/remark-frontmatter`][remark-frontmatter]
    — remark plugin using this to support frontmatter
*   [`micromark/micromark`][micromark]
    — the smallest commonmark-compliant markdown parser that exists
*   [`syntax-tree/mdast-util-frontmatter`][mdast-util-frontmatter]
    — mdast utility to support frontmatter
*   [`syntax-tree/mdast-util-from-markdown`][from-markdown]
    — mdast parser using `micromark` to create mdast from markdown
*   [`syntax-tree/mdast-util-to-markdown`][to-markdown]
    — mdast serializer to create markdown from mdast

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-frontmatter/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-frontmatter/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-frontmatter.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-frontmatter

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-frontmatter.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-frontmatter

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-frontmatter.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-frontmatter

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[micromark]: https://github.com/micromark/micromark

[from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[remark]: https://github.com/remarkjs/remark

[mdast-util-frontmatter]: https://github.com/syntax-tree/mdast-util-frontmatter

[remark-frontmatter]: https://github.com/remarkjs/remark-frontmatter

[preset]: #preset

[matter]: #matter
