# mdast-util-gfm-footnote

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Extension for [`mdast-util-from-markdown`][from-markdown] and/or
[`mdast-util-to-markdown`][to-markdown] to support GitHub flavored markdown
(GFM) footnotes in **[mdast][]**.
When parsing (`from-markdown`), must be combined with
[`micromark-extension-gfm-footnote`][extension].

GFM footnotes were [announced September 30, 2021][post] but are neither
specified nor supported in all their products (e.g., Gists).
Their implementation on github.com is currently quite buggy.
The bugs have been reported on
[`cmark-gfm`](https://github.com/github/cmark-gfm).
This micromark extension matches github.com except for its bugs.

## When to use this

Use [`mdast-util-gfm`][mdast-util-gfm] if you want all of GFM.
Use this otherwise.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install mdast-util-gfm-footnote
```

## Use

Say our module, `example.js`, looks as follows:

```js
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {gfmFootnote} from 'micromark-extension-gfm-footnote'
import {gfmFootnoteFromMarkdown, gfmFootnoteToMarkdown} from 'mdast-util-gfm-footnote'

const doc = 'Hi![^1]\n\n[^1]: big note'

const tree = fromMarkdown(doc, {
  extensions: [gfmFootnote()],
  mdastExtensions: [gfmFootnoteFromMarkdown()]
})

console.log(tree)

const out = toMarkdown(tree, {extensions: [gfmFootnoteToMarkdown()]})

console.log(out)
```

Now, running `node example` yields:

```js
{
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {type: 'text', value: 'Hi!'},
        {type: 'footnoteReference', identifier: '1', label: '1'}
      ]
    },
    {
      type: 'footnoteDefinition',
      identifier: '1',
      label: '1',
      children: [
        {type: 'paragraph', children: [{type: 'text', value: 'big note'}]}
      ]
    }
  ]
}
```

```markdown
Hi\![^1]

[^1]: big note
```

## API

### `gfmFootnoteFromMarkdown()`

### `gfmFootnoteToMarkdown()`

Support footnotes.
The exports are functions that can be called to get extensions, respectively
for [`mdast-util-from-markdown`][from-markdown] and
[`mdast-util-to-markdown`][to-markdown].

## Related

*   [`remarkjs/remark`][remark]
    — markdown processor powered by plugins
*   [`remarkjs/remark-gfm`][remark-gfm]
    — remark plugin to support GFM
*   [`micromark/micromark`][micromark]
    — the smallest commonmark-compliant markdown parser that exists
*   [`micromark/micromark-extension-gfm-footnote`][extension]
    — micromark extension to parse GFM footnotes
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

[build-badge]: https://github.com/syntax-tree/mdast-util-gfm-footnote/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/mdast-util-gfm-footnote/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/mdast-util-gfm-footnote.svg

[coverage]: https://codecov.io/github/syntax-tree/mdast-util-gfm-footnote

[downloads-badge]: https://img.shields.io/npm/dm/mdast-util-gfm-footnote.svg

[downloads]: https://www.npmjs.com/package/mdast-util-gfm-footnote

[size-badge]: https://img.shields.io/bundlephobia/minzip/mdast-util-gfm-footnote.svg

[size]: https://bundlephobia.com/result?p=mdast-util-gfm-footnote

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

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[remark]: https://github.com/remarkjs/remark

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[micromark]: https://github.com/micromark/micromark

[extension]: https://github.com/micromark/micromark-extension-gfm-footnote

[post]: https://github.blog/changelog/2021-09-30-footnotes-now-supported-in-markdown-fields/
