# mdast-util-frontmatter

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Extension for [`mdast-util-from-markdown`][from-markdown] and/or
[`mdast-util-to-markdown`][to-markdown] to support frontmatter in **[mdast][]**.
When parsing (`from-markdown`), must be combined with
[`micromark-extension-frontmatter`][extension].

## When to use this

Use this if you’re dealing with the AST manually.
It’s probably nicer to use [`remark-frontmatter`][remark-frontmatter] with
**[remark][]**, which includes this but provides a nicer interface and
makes it easier to combine with hundreds of plugins.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install mdast-util-frontmatter
```

## Use

Say we have the following file, `example.md`:

```markdown
+++
title = "New Website"
+++

# Other markdown
```

And our module, `example.js`, looks as follows:

```js
import fs from 'node:fs'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {frontmatter} from 'micromark-extension-frontmatter'
import {frontmatterFromMarkdown, frontmatterToMarkdown} from 'mdast-util-frontmatter'

const doc = fs.readFileSync('example.md')

const tree = fromMarkdown(doc, {
  extensions: [frontmatter(['yaml', 'toml'])],
  mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])]
})

console.log(tree)

const out = toMarkdown(tree, {extensions: [frontmatterToMarkdown(['yaml', 'toml'])]})

console.log(out)
```

Now, running `node example` yields:

```js
{
  type: 'root',
  children: [
    {type: 'toml', value: 'title = "New Website"'},
    {
      type: 'heading',
      depth: 1,
      children: [{type: 'text', value: 'Other markdown'}]
    }
  ]
}
```

```markdown
+++
title = "New Website"
+++

# Other markdown
```

## API

This package exports the following identifiers: `frontmatterFromMarkdown`,
`frontmatterToMarkdown`.
There is no default export.

### `frontmatterFromMarkdown([options])`

### `frontmatterToMarkdown([options])`

Support frontmatter (YAML, TOML, and more).
These functions can be called with options and return extensions, respectively
for [`mdast-util-from-markdown`][from-markdown] and
[`mdast-util-to-markdown`][to-markdown].

Options are the same as [`micromark-extension-frontmatter`][options].

## Related

*   [`remarkjs/remark`][remark]
    — markdown processor powered by plugins
*   [`remarkjs/remark-frontmatter`][remark-frontmatter]
    — remark plugin to support frontmatter
*   [`micromark/micromark`][micromark]
    — the smallest commonmark-compliant markdown parser that exists
*   [`micromark/micromark-extension-frontmatter`][extension]
    — micromark extension to parse frontmatter
*   [`syntax-tree/mdast-util-from-markdown`][from-markdown]
    — mdast parser using `micromark` to create mdast from markdown
*   [`syntax-tree/mdast-util-to-markdown`][to-markdown]
    — mdast serializer to create markdown from mdast

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/mdast-util-frontmatter/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/mdast-util-frontmatter/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/mdast-util-frontmatter.svg

[coverage]: https://codecov.io/github/syntax-tree/mdast-util-frontmatter

[downloads-badge]: https://img.shields.io/npm/dm/mdast-util-frontmatter.svg

[downloads]: https://www.npmjs.com/package/mdast-util-frontmatter

[size-badge]: https://img.shields.io/bundlephobia/minzip/mdast-util-frontmatter.svg

[size]: https://bundlephobia.com/result?p=mdast-util-frontmatter

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[mdast]: https://github.com/syntax-tree/mdast

[remark]: https://github.com/remarkjs/remark

[remark-frontmatter]: https://github.com/remarkjs/remark-frontmatter

[from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[micromark]: https://github.com/micromark/micromark

[extension]: https://github.com/micromark/micromark-extension-frontmatter

[options]: https://github.com/micromark/micromark-extension-frontmatter#options
