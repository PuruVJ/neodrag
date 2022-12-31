# rehype-parse

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[rehype][]** plugin to add support for parsing HTML input.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeParse[, options])`](#unifieduserehypeparse-options)
*   [Examples](#examples)
    *   [Example: fragment versus document](#example-fragment-versus-document)
    *   [Example: whitespace around and inside `<html>`](#example-whitespace-around-and-inside-html)
    *   [Example: parse errors](#example-parse-errors)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin that defines how to take HTML
as input and turn it into a syntax tree.
When it’s used, HTML can be parsed and other rehype plugins can be used after
it.

See [the monorepo readme][rehype] for info on what the rehype ecosystem is.

## When should I use this?

This plugin adds support to unified for parsing HTML.
You can alternatively use [`rehype`][rehype-core] instead, which combines
unified, this plugin, and [`rehype-stringify`][rehype-stringify].

When you’re in a browser, trust your content, don’t need positional info, and
value a smaller bundle size, you can use [`rehype-dom-parse`][rehype-dom-parse]
instead.

This plugin is built on [`parse5`][parse5] and
[`hast-util-from-parse5`][hast-util-from-parse5], which deal with HTML-compliant
tokenizing, parsing, and creating nodes.
rehype focusses on making it easier to transform content by abstracting such
internals away.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install rehype-parse
```

In Deno with [Skypack][]:

```js
import rehypeParse from 'https://cdn.skypack.dev/rehype-parse@8?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import rehypeParse from 'https://cdn.skypack.dev/rehype-parse@8?min'
</script>
```

## Use

Say we have the following module `example.js`:

```js
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'

main()

async function main() {
  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process('<h1>Hello, world!</h1>')

  console.log(String(file))
}
```

…running that with `node example.js` yields:

```markdown
# Hello, world!
```

## API

This package exports no identifiers.
The default export is `rehypeParse`.

### `unified().use(rehypeParse[, options])`

Add support for parsing HTML input.

##### `options`

Configuration (optional).

###### `options.fragment`

Specify whether to parse as a fragment (`boolean`, default: `false`).
The default is to expect a whole document.
In document mode, unopened `html`, `head`, and `body` elements are opened.

###### `options.space`

Which space the document is in (`'svg'` or `'html'`, default: `'html'`).

When an `<svg>` element is found in the HTML space, `rehype-parse` already
automatically switches to and from the SVG space when entering and exiting it.

> 👉 **Note**: rehype is not an XML parser.
> It supports SVG as embedded in HTML.
> It does not support the features available in XML.
> Passing SVG files might break but fragments of modern SVG should be fine.

> 👉 **Note**: make sure to set `fragment: true` if `space: 'svg'`.

###### `options.emitParseErrors`

Emit [HTML parse errors][parse-errors] as warning messages
(`boolean`, default: `false`).

Specific rules can be turned off by setting their IDs in `options` to `false`
(or `0`).
The default, when `emitParseErrors: true`, is `true` (or `1`), and means that
rules emit as warnings.
Rules can also be configured with `2`, to turn them into fatal errors.

The list of parse errors:

<!-- parse-error start -->

*   `abandonedHeadElementChild` — unexpected metadata element after head ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/abandoned-head-element-child/index.html))
*   [`abruptClosingOfEmptyComment`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-abrupt-closing-of-empty-comment) — unexpected abruptly closed empty comment ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/abrupt-closing-of-empty-comment/index.html))
*   [`abruptDoctypePublicIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-abrupt-doctype-public-identifier) — unexpected abruptly closed public identifier ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/abrupt-doctype-public-identifier/index.html))
*   [`abruptDoctypeSystemIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-abrupt-doctype-system-identifier) — unexpected abruptly closed system identifier ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/abrupt-doctype-system-identifier/index.html))
*   [`absenceOfDigitsInNumericCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-absence-of-digits-in-numeric-character-reference) — unexpected non-digit at start of numeric character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/absence-of-digits-in-numeric-character-reference/index.html))
*   [`cdataInHtmlContent`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-cdata-in-html-content) — unexpected CDATA section in HTML ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/cdata-in-html-content/index.html))
*   [`characterReferenceOutsideUnicodeRange`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-character-reference-outside-unicode-range) — unexpected too big numeric character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/character-reference-outside-unicode-range/index.html))
*   `closingOfElementWithOpenChildElements` — unexpected closing tag with open child elements ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/closing-of-element-with-open-child-elements/index.html))
*   [`controlCharacterInInputStream`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-control-character-in-input-stream) — unexpected control character ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/control-character-in-input-stream/index.html))
*   [`controlCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-control-character-reference) — unexpected control character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/control-character-reference/index.html))
*   `disallowedContentInNoscriptInHead` — disallowed content inside `<noscript>` in `<head>` ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/disallowed-content-in-noscript-in-head/index.html))
*   [`duplicateAttribute`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-duplicate-attribute) — unexpected duplicate attribute ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/duplicate-attribute/index.html))
*   [`endTagWithAttributes`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-end-tag-with-attributes) — unexpected attribute on closing tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/end-tag-with-attributes/index.html))
*   [`endTagWithTrailingSolidus`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-end-tag-with-trailing-solidus) — unexpected slash at end of closing tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/end-tag-with-trailing-solidus/index.html))
*   `endTagWithoutMatchingOpenElement` — unexpected unopened end tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/end-tag-without-matching-open-element/index.html))
*   [`eofBeforeTagName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-eof-before-tag-name) — unexpected end of file ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-before-tag-name/index.html))
*   [`eofInCdata`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-eof-in-cdata) — unexpected end of file in CDATA ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-in-cdata/index.html))
*   [`eofInComment`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-eof-in-comment) — unexpected end of file in comment ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-in-comment/index.html))
*   [`eofInDoctype`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-eof-in-doctype) — unexpected end of file in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-in-doctype/index.html))
*   `eofInElementThatCanContainOnlyText` — unexpected end of file in element that can only contain text ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-in-element-that-can-contain-only-text/index.html))
*   [`eofInScriptHtmlCommentLikeText`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-eof-in-script-html-comment-like-text) — unexpected end of file in comment inside script ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-in-script-html-comment-like-text/index.html))
*   [`eofInTag`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-eof-in-tag) — unexpected end of file in tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/eof-in-tag/index.html))
*   [`incorrectlyClosedComment`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-incorrectly-closed-comment) — incorrectly closed comment ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/incorrectly-closed-comment/index.html))
*   [`incorrectlyOpenedComment`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-incorrectly-opened-comment) — incorrectly opened comment ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/incorrectly-opened-comment/index.html))
*   [`invalidCharacterSequenceAfterDoctypeName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-invalid-character-sequence-after-doctype-name) — invalid sequence after doctype name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/invalid-character-sequence-after-doctype-name/index.html))
*   [`invalidFirstCharacterOfTagName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-invalid-first-character-of-tag-name) — invalid first character in tag name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/invalid-first-character-of-tag-name/index.html))
*   `misplacedDoctype` — misplaced doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/misplaced-doctype/index.html))
*   `misplacedStartTagForHeadElement` — misplaced `<head>` start tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/misplaced-start-tag-for-head-element/index.html))
*   [`missingAttributeValue`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-attribute-value) — missing attribute value ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-attribute-value/index.html))
*   `missingDoctype` — missing doctype before other content ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-doctype/index.html))
*   [`missingDoctypeName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-doctype-name) — missing doctype name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-doctype-name/index.html))
*   [`missingDoctypePublicIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-doctype-public-identifier) — missing public identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-doctype-public-identifier/index.html))
*   [`missingDoctypeSystemIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-doctype-system-identifier) — missing system identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-doctype-system-identifier/index.html))
*   [`missingEndTagName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-end-tag-name) — missing name in end tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-end-tag-name/index.html))
*   [`missingQuoteBeforeDoctypePublicIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-quote-before-doctype-public-identifier) — missing quote before public identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-quote-before-doctype-public-identifier/index.html))
*   [`missingQuoteBeforeDoctypeSystemIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-quote-before-doctype-system-identifier) — missing quote before system identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-quote-before-doctype-system-identifier/index.html))
*   [`missingSemicolonAfterCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-semicolon-after-character-reference) — missing semicolon after character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-semicolon-after-character-reference/index.html))
*   [`missingWhitespaceAfterDoctypePublicKeyword`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-whitespace-after-doctype-public-keyword) — missing whitespace after public identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-whitespace-after-doctype-public-keyword/index.html))
*   [`missingWhitespaceAfterDoctypeSystemKeyword`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-whitespace-after-doctype-system-keyword) — missing whitespace after system identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-whitespace-after-doctype-system-keyword/index.html))
*   [`missingWhitespaceBeforeDoctypeName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-whitespace-before-doctype-name) — missing whitespace before doctype name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-whitespace-before-doctype-name/index.html))
*   [`missingWhitespaceBetweenAttributes`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-whitespace-between-attributes) — missing whitespace between attributes ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-whitespace-between-attributes/index.html))
*   [`missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-whitespace-between-doctype-public-and-system-identifiers) — missing whitespace between public and system identifiers in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/missing-whitespace-between-doctype-public-and-system-identifiers/index.html))
*   [`nestedComment`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-nested-comment) — unexpected nested comment ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/nested-comment/index.html))
*   `nestedNoscriptInHead` — unexpected nested `<noscript>` in `<head>` ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/nested-noscript-in-head/index.html))
*   `nonConformingDoctype` — unexpected non-conforming doctype declaration ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/non-conforming-doctype/index.html))
*   [`nonVoidHtmlElementStartTagWithTrailingSolidus`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-non-void-html-element-start-tag-with-trailing-solidus) — unexpected trailing slash on start tag of non-void element ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/non-void-html-element-start-tag-with-trailing-solidus/index.html))
*   [`noncharacterCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-noncharacter-character-reference) — unexpected noncharacter code point referenced by character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/noncharacter-character-reference/index.html))
*   [`noncharacterInInputStream`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-noncharacter-in-input-stream) — unexpected noncharacter character ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/noncharacter-in-input-stream/index.html))
*   [`nullCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-null-character-reference) — unexpected NULL character referenced by character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/null-character-reference/index.html))
*   `openElementsLeftAfterEof` — unexpected end of file ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/open-elements-left-after-eof/index.html))
*   [`surrogateCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-surrogate-character-reference) — unexpected surrogate character referenced by character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/surrogate-character-reference/index.html))
*   [`surrogateInInputStream`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-surrogate-in-input-stream) — unexpected surrogate character
*   [`unexpectedCharacterAfterDoctypeSystemIdentifier`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-character-after-doctype-system-identifier) — invalid character after system identifier in doctype ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-character-after-doctype-system-identifier/index.html))
*   [`unexpectedCharacterInAttributeName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-character-in-attribute-name) — unexpected character in attribute name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-character-in-attribute-name/index.html))
*   [`unexpectedCharacterInUnquotedAttributeValue`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-character-in-unquoted-attribute-value) — unexpected character in unquoted attribute value ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-character-in-unquoted-attribute-value/index.html))
*   [`unexpectedEqualsSignBeforeAttributeName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-equals-sign-before-attribute-name) — unexpected equals sign before attribute name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-equals-sign-before-attribute-name/index.html))
*   [`unexpectedNullCharacter`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-null-character) — unexpected NULL character ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-null-character/index.html))
*   [`unexpectedQuestionMarkInsteadOfTagName`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-question-mark-instead-of-tag-name) — unexpected question mark instead of tag name ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-question-mark-instead-of-tag-name/index.html))
*   [`unexpectedSolidusInTag`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unexpected-solidus-in-tag) — unexpected slash in tag ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unexpected-solidus-in-tag/index.html))
*   [`unknownNamedCharacterReference`](https://html.spec.whatwg.org/multipage/parsing.html#parse-error-unknown-named-character-reference) — unexpected unknown named character reference ([example](https://github.com/rehypejs/rehype/blob/main/test/parse-error/unknown-named-character-reference/index.html))

<!-- parse-error end -->

###### `options.verbose`

Add extra positional info (`boolean`, default: `false`).

## Examples

### Example: fragment versus document

The following example shows the difference between parsing as a document and
parsing as a fragment:

```js
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'

main()

async function main() {
  const doc = '<title>Hi!</title><h1>Hello!</h1>'

  console.log(
    String(
      await unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeStringify)
        .process(doc)
    )
  )

  console.log(
    String(
      await unified()
        .use(rehypeParse, {fragment: false})
        .use(rehypeStringify)
        .process(doc)
    )
  )
}
```

…yields:

```html
<title>Hi!</title><h1>Hello!</h1>
```

```html
<html><head><title>Hi!</title></head><body><h1>Hello!</h1></body></html>
```

> 👉 **Note**: observe that when a whole document is expected (second example),
> missing elements are opened and closed.

### Example: whitespace around and inside `<html>`

The following example shows how whitespace is handled when around and directly
inside the `<html>` element:

```js
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'

main(`<!doctype html>
<html lang=en>
  <head>
    <title>Hi!</title>
  </head>
  <body>
    <h1>Hello!</h1>
  </body>
</html>`)

async function main(doc) {
  console.log(
    String(await unified().use(rehypeParse).use(rehypeStringify).process(doc))
  )
}
```

…yields (where `␠` represents a space character):

```html
<!doctype html><html lang="en"><head>
    <title>Hi!</title>
  </head>
  <body>
    <h1>Hello!</h1>
␠␠
</body></html>
```

> 👉 **Note**: observe that the line ending before `<html>` is ignored, the line
> ending and two spaces before `<head>` is moved inside it, and the line ending
> after `</body>` is moved before it.

This behavior is described by the HTML standard (see the section 13.2.6.4.1
“The ‘initial’ insertion mode” and adjacent states) which rehype follows.

The changes to this meaningless whitespace should not matter, except when
formatting markup, in which case [`rehype-format`][rehype-format] can be used to
improve the source code.

### Example: parse errors

The following example shows how HTML parse errors can be enabled and configured:

```js
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'

main()

async function main() {
  const file = await unified()
    .use(rehypeParse, {
      emitParseErrors: true, // Emit all.
      missingWhitespaceBeforeDoctypeName: 2, // Mark one as a fatal error.
      nonVoidHtmlElementStartTagWithTrailingSolidus: false // Ignore one.
    })
    .use(rehypeStringify)
    .process(`<!doctypehtml>
<title class="a" class="b">Hello…</title>
<h1/>World!</h1>`)

  console.log(reporter(file))
}
```

…yields:

```html
  1:10-1:10  error    Missing whitespace before doctype name  missing-whitespace-before-doctype-name  parse-error
  2:23-2:23  warning  Unexpected duplicate attribute          duplicate-attribute                     parse-error

2 messages (✖ 1 error, ⚠ 1 warning)
```

> 🧑‍🏫 **Info**: messages in unified are warnings instead of errors.
> Other linters (such as ESLint) almost always use errors.
> Why?
> Those tools *only* check code style.
> They don’t generate, transform, and format code, which is what rehype and
> unified focus on, too.
> Errors in unified mean the same as an exception in your JavaScript code: a
> crash.
> That’s why we use warnings instead, because we continue checking more HTML and
> continue running more plugins.

## Syntax

HTML is parsed according to WHATWG HTML (the living standard), which is also
followed by browsers such as Chrome and Firefox.

## Syntax tree

The syntax tree format used in rehype is [hast][].

## Types

This package is fully typed with [TypeScript][].
The extra types `Options`, `ErrorCode`, and `ErrorSeverity` are exported.

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

[downloads-badge]: https://img.shields.io/npm/dm/rehype-parse.svg

[downloads]: https://www.npmjs.com/package/rehype-parse

[size-badge]: https://img.shields.io/bundlephobia/minzip/rehype-parse.svg

[size]: https://bundlephobia.com/result?p=rehype-parse

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/rehypejs/rehype/discussions

[security]: https://github.com/rehypejs/.github/blob/main/security.md

[health]: https://github.com/rehypejs/.github

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

[rehype-stringify]: ../rehype-stringify/

[rehype-core]: ../rehype/

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[hast-util-from-parse5]: https://github.com/syntax-tree/hast-util-from-parse5

[parse-errors]: https://html.spec.whatwg.org/multipage/parsing.html#parse-errors

[rehype-dom-parse]: https://github.com/rehypejs/rehype-dom/tree/main/packages/rehype-dom-parse

[rehype-format]: https://github.com/rehypejs/rehype-format

[parse5]: https://github.com/inikulin/parse5
