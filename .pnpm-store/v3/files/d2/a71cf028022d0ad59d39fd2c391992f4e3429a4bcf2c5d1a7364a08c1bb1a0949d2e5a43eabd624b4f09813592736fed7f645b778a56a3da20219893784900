# @astrojs/compiler

## 0.29.19

### Patch Changes

- 3365233: Replace internal tokenizer state logs with proper warnings

## 0.29.18

### Patch Changes

- 80de395: fix: avoid nil pointer dereference in table parsing
- aa3ad9d: Fix `parse` output to properly account for the location of self-closing tags
- b89dec4: Internally, replace `astro.ParseFragment` in favor of `astro.ParseFragmentWithOptions`. We now check whether an error handler is passed when calling `astro.ParseFragmentWithOptions`

## 0.29.17

### Patch Changes

- 1e7e098: Add warning for invalid spread attributes
- 3cc6f55: Fix handling of unterminated template literal attributes
- 48c5677: Update default `internalURL` to `astro/runtime/server/index.js`
- 2893f33: Fix a number of `table` and `expression` related bugs

## 0.29.16

### Patch Changes

- ec745f4: Self-closing tags will now retreive "end" positional data
- a6c2822: Fix a few TSX output errors

## 0.29.15

### Patch Changes

- 5f6e69b: Fix expression literal handling

## 0.29.14

### Patch Changes

- 6ff1d80: Fix regression introduced by https://github.com/withastro/compiler/pull/617

## 0.29.13

### Patch Changes

- 8f3e488: Fix regression introduced to `parse` handling in the last patch

## 0.29.12

### Patch Changes

- a41982a: Fix expression edge cases, improve literal parsing

## 0.29.11

### Patch Changes

- ee907f1: Fix #5308, duplicate style bug when using `define:vars`

## 0.29.10

### Patch Changes

- 07a65df: Print `\r` when printing TSX output
- 1250d0b: Add warning when `define:vars` won't work because of compilation limitations

## 0.29.9

### Patch Changes

- 1fe92c0: Fix TSX sourcemaps on Windows (take 4)

## 0.29.8

### Patch Changes

- 01b62ea: Fix sourcemap bug on Windows (again x2)

## 0.29.7

### Patch Changes

- 108c6c9: Fix TSX sourcemap bug on Windows (again)

## 0.29.6

### Patch Changes

- 4b3fafa: Fix TSX sourcemaps on Windows

## 0.29.5

### Patch Changes

- 73a2b69: Use an IIFE for define:vars scripts

## 0.29.4

### Patch Changes

- 4381efa: Return proper diagnostic code for warnings

## 0.29.3

### Patch Changes

- 85e1d31: AST: move `start` position of elements to the first index of their opening tag

## 0.29.2

### Patch Changes

- 035829b: AST: move end position of elements to the last index of their end tag

## 0.29.1

### Patch Changes

- a99c014: Ensure comment and text nodes have end positions when generating an AST from `parse`

## 0.29.0

### Minor Changes

- fd2fc28: Fix some utf8 compatability issues

### Patch Changes

- 4b68670: TSX: fix edge case with spread attribute printing
- 6b204bd: Fix bug with trailing `style` tags being moved into the `html` element
- 66fe230: Fix: include element end location in `parse` AST

## 0.28.1

### Patch Changes

- aac8c89: Fix end tag sourcemappings for TSX mode
- d7f3288: TSX: Improve self-closing tag behavior and mappings
- 75dd7cc: Fix spread attribute mappings

## 0.28.0

### Minor Changes

- 5da0dc2: Add `resolvePath` option to control hydration path resolution
- e816a61: Remove metadata export if `resolvePath` option provided

## 0.27.2

### Patch Changes

- 959f96b: Fix "missing sourcemap" issue
- 94f6f3e: Fix edge case with multi-line comment usage
- 85a654a: Fix `parse` causing a compiler panic when a component with a client directive was imported but didn't have a matching import
- 5e32cbe: Improvements to TSX output

## 0.27.1

### Patch Changes

- cc9f174: fixed regression caused by #546

## 0.27.0

### Minor Changes

- c770e7b: The compiler will now return `diagnostics` and unique error codes to be handled by the consumer. For example:

  ```js
  import type { DiagnosticSeverity, DiagnosticCode } from '@astrojs/compiler/types';
  import { transform } from '@astrojs/compiler';

  async function run() {
    const { diagnostics } = await transform(file, opts);

    function log(severity: DiagnosticSeverity, message: string) {
      switch (severity) {
        case DiagnosticSeverity.Error:
          return console.error(message);
        case DiagnosticSeverity.Warning:
          return console.warn(message);
        case DiagnosticSeverity.Information:
          return console.info(message);
        case DiagnosticSeverity.Hint:
          return console.info(message);
      }
    }

    for (const diagnostic of diagnostics) {
      let message = diagnostic.text;
      if (diagnostic.hint) {
        message += `\n\n[hint] ${diagnostic.hint}`;
      }

      // Or customize messages for a known DiagnosticCode
      if (diagnostic.code === DiagnosticCode.ERROR_UNMATCHED_IMPORT) {
        message = `My custom message about an unmatched import!`;
      }
      log(diagnostic.severity, message);
    }
  }
  ```

### Patch Changes

- 0b24c24: Implement automatic typing for Astro.props in the TSX output

## 0.26.1

### Patch Changes

- 920898c: Handle edge case with `noscript` tags
- 8ee78a6: handle slots that contains the head element
- 244e43e: Do not hoist import inside object
- b8cd954: Fix edge case with line comments and export hoisting
- 52ebfb7: Fix parse/tsx output to gracefully handle invalid HTML (style outside of body, etc)
- 884efc6: Fix edge case with multi-line export hoisting

## 0.26.0

### Minor Changes

- 0be58ab: Improve sourcemap support for TSX output

### Patch Changes

- e065e29: Prevent head injection from removing script siblings

## 0.25.2

### Patch Changes

- 3a51b8e: Ensure that head injection occurs if there is only a hoisted script

## 0.25.1

### Patch Changes

- 41fae67: Do not scope empty style blocks
- 1ab8280: fix(#517): fix edge case with TypeScript transform
- a3678f9: Fix import.meta.env usage above normal imports

## 0.25.0

### Minor Changes

- 6446ea3: Make Astro styles being printed after user imports

### Patch Changes

- 51bc60f: Fix edge cases with `getStaticPaths` where valid JS syntax was improperly handled

## 0.24.0

### Minor Changes

- 6ebcb4f: Allow preprocessStyle to return an error

### Patch Changes

- abda605: Include filename when calculating scope

## 0.23.5

### Patch Changes

- 6bc8e0b: Prevent import assertion from being scanned too soon

## 0.23.4

### Patch Changes

- 3b9f0d2: Remove css print escape for experimentalStaticExtraction

## 0.23.3

### Patch Changes

- 7693d76: Fix resolution of .jsx modules

## 0.23.2

### Patch Changes

- 167ad21: Improve handling of namespaced components when they are multiple levels deep
- 9283258: Fix quotations in pre-quoted attributes
- 76fcef3: Better handling for imports which use special characters

## 0.23.1

### Patch Changes

- 79376f3: Fix regression with expression rendering

## 0.23.0

### Minor Changes

- d8448e2: Prevent printing the doctype in the JS output

### Patch Changes

- a28c3d8: Fix handling of unbalanced quotes in expression attributes
- 28d1d4d: Fix handling of TS generics inside of expressions
- 356d3b6: Prevent wraping module scripts with scope

## 0.22.1

### Patch Changes

- 973103c: Prevents unescaping attribute expressions

## 0.22.0

### Minor Changes

- 558c9dd: Generate a stable scoped class that does _NOT_ factor in local styles. This will allow us to safely do style HMR without needing to update the DOM as well.
- c19cd8c: Update Astro's CSS scoping algorithm to implement zero-specificity scoping, according to [RFC0012](https://github.com/withastro/rfcs/blob/main/proposals/0012-scoped-css-with-preserved-specificity.md).

## 0.21.0

### Minor Changes

- 8960d82: New handling for `define:vars` scripts and styles

### Patch Changes

- 4b318d5: Do not attempt to hoist styles or scripts inside of `<noscript>`
- d6ebab6: Fixing missing semicolon on TSX Frontmatter last-entries

## 0.20.0

### Minor Changes

- 48d33ff: Removes compiler special casing for the Markdown component
- 4a5352e: Removes limitation where imports/exports must be at the top of an `.astro` file. Fixes various edge cases around `getStaticPaths` hoisting.

### Patch Changes

- 245d73e: Add support for HTML minification by passing `compact: true` to `transform`.
- 3ecdd24: Update TSX output to also generate TSX-compatible code for attributes containing dots

## 0.19.0

### Minor Changes

- fcb4834: Removes fallback for the site configuration

### Patch Changes

- 02add77: Fixes many edge cases around tables when used with components, slots, or expressions
- b23dd4d: Fix handling of unmatched close brace in template literals
- 9457a91: Fix issue with `{` in template literal attributes
- c792161: Fix nested expression handling with a proper expression tokenizer stack

## 0.18.2

### Patch Changes

- f8547a7: Revert [#448](https://github.com/withastro/compiler/pull/448) for now

## 0.18.1

### Patch Changes

- aff2f23: Warning on client: usage on scripts

## 0.18.0

### Minor Changes

- 4b02776: Fix handling of `slot` attribute used inside of expressions

### Patch Changes

- 62d2a8e: Properly handle nested expressions that return multiple elements
- 571d6b9: Ensure `html` and `body` elements are scoped

## 0.17.1

### Patch Changes

- 3885217: Support `<slot is:inline />` and preserve slot attribute when not inside component
- ea94a26: Fix issue with fallback content inside of slots

## 0.17.0

### Minor Changes

- 3a9d166: Add renderHead injection points

## 0.16.1

### Patch Changes

- 9fcc43b: Build JS during the release

## 0.16.0

### Minor Changes

- 470efc0: Adds component metadata to the TransformResult

### Patch Changes

- c104d4f: Fix #418: duplicate text when only text

## 0.15.2

### Patch Changes

- f951822: Fix wasm `parse` to save attribute namespace
- 5221e09: Fix serialize spread attribute

## 0.15.1

### Patch Changes

- 26cbcdb: Prevent side-effectual CSS imports from becoming module metadata

## 0.15.0

### Minor Changes

- 702e848: Trailing space at the end of Astro files is now stripped from Component output.

### Patch Changes

- 3a1a24b: Fix long-standing bug where a `class` attribute inside of a spread prop will cause duplicate `class` attributes
- 62faceb: Fixes an issue where curly braces in `<math>` elements would get parsed as expressions instead of raw text.

## 0.14.3

### Patch Changes

- 6177620: Fix edge case with expressions inside of tables
- 79b1ed6: Provides a better error message when we can't match client:only usage to an import statement
- a4e1957: Fix Astro scoping when `class:list` is used
- fda859a: Fix json escape

## 0.14.2

### Patch Changes

- 6f30e2e: Fix edge case with nested expression inside `<>`
- 15e3ff8: Fix panic when using a `<slot />` in `head`
- c048567: Fix edge case with `select` elements and expression children
- 13d2fc2: Fix #340, fixing behavior of content after an expression inside of `<select>`
- 9e37a72: Fix issue when multiple client-only components are used
- 67993d5: Add support for block comment only expressions, block comment only shorthand attributes and block comments in shorthand attributes
- 59fbea2: Fix #343, edge case with `<tr>` inside component
- 049dadf: Fix usage of expressions inside `caption` and `colgroup` elements

## 0.14.1

### Patch Changes

- 1a82892: Fix bug with `<script src>` not being hoisted

## 0.14.0

### Minor Changes

- c0da4fe: Implements [RFC0016](https://github.com/withastro/rfcs/blob/main/proposals/0016-style-script-defaults.md), the new `script` and `style` behavior.

## 0.13.2

### Patch Changes

- 014370d: Fix issue with named slots in <head> element
- da831c1: Fix handling of RegExp literals in frontmatter

## 0.13.1

### Patch Changes

- 2f8334c: Update `parse` and `serialize` functions to combine `attributes` and `directives`, fix issue with `serialize` not respecting `attributes`.
- b308955: Add self-close option to serialize util

## 0.13.0

### Minor Changes

- ce3f1a5: Update CSS parser to use `esbuild`, adding support for CSS nesting, `@container`, `@layer`, and other modern syntax features

### Patch Changes

- 24a1185: Parser: Always output the `children` property in an element node, even if it has no children

## 0.12.1

### Patch Changes

- 097ac47: Parser: Always output the `attribute` property in an element node, even if empty
- ad62437: Add `serialize` util
- eb7eb95: Parse: fix escaping of `&` characters in AST output

## 0.12.0

### Minor Changes

- c6dd41d: Do not render implicit tags created during the parsing process
- c6dd41d: Remove "as" option, treats all documents as fragments that generate no implicit tags
- c6dd41d: Add `parse` function which generates an AST
- c6dd41d: Adds support for `Astro.self` (as accepted in the [Recursive Components RFC](https://github.com/withastro/rfcs/blob/main/active-rfcs/0000-recursive-components.md)).

### Patch Changes

- c6dd41d: Add `fragment` node types to AST definitions, expose Fragment helper to utils
- c6dd41d: Adds metadata on client:only components
- c6dd41d: Expose AST types via `@astrojs/compiler/types`
- c6dd41d: Export `./types` rather than `./types.d.ts`
- c6dd41d: Fix edge case with Fragment parsing in head, add `fragment` node to AST output
- c6dd41d: Fix <slot> behavior inside of head
- c6dd41d: Improve head injection behavior
- ef0b4b3: Move `typescript` dependency to development dependencies, as it is not needed in the package runtime.
- c6dd41d: Update exposed types
- c6dd41d: Remove usage of `escapeHTML` util
- c6dd41d: Export all types from shared types
- c6dd41d: Fix `head` behavior and a bug related to ParseFragment
- c6dd41d: Adds a warning when using an expression with a hoisted script

## 0.12.0-next.9

### Patch Changes

- 95ec808: Fix <slot> behavior inside of head
- 95ec808: Remove usage of `escapeHTML` util

## 0.12.0-next.8

### Patch Changes

- 4497628: Improve head injection behavior

## 0.12.0-next.7

### Patch Changes

- e26b9d6: Fix edge case with Fragment parsing in head, add `fragment` node to AST output

## 0.12.0-next.6

### Patch Changes

- 37ef1c1: Fix `head` behavior and a bug related to ParseFragment

## 0.12.0-next.5

### Patch Changes

- 97cf66b: Adds metadata on client:only components

## 0.12.0-next.4

### Patch Changes

- e2061dd: Export all types from shared types

## 0.12.0-next.3

### Patch Changes

- ef69b74: Export `./types` rather than `./types.d.ts`

## 0.12.0-next.2

### Patch Changes

- 073b0f1: Adds a warning when using an expression with a hoisted script

## 0.12.0-next.1

### Patch Changes

- a539d53: Update exposed types

## 0.12.0-next.0

### Minor Changes

- 8ce39c7: Do not render implicit tags created during the parsing process
- 41b825a: Remove "as" option, treats all documents as fragments that generate no implicit tags
- 483b34b: Add `parse` function which generates an AST
- 9e5e2f8: Adds support for `Astro.self` (as accepted in the [Recursive Components RFC](https://github.com/withastro/rfcs/blob/main/active-rfcs/0000-recursive-components.md)).

### Patch Changes

- 16b167c: Expose AST types via `@astrojs/compiler/types`

## 0.11.4

### Patch Changes

- 99b5de2: Reset tokenizer state when a raw element that is self-closing is encountered.

  This fixes the handling of self-closing elements like `<title />` and `<script />` when used with `set:html`.

## 0.11.3

### Patch Changes

- dcf15bf: Fixes bug causing a crash when using Astro.resolve on a hoisted script

## 0.11.2

### Patch Changes

- 41cc6ef: Fix memory issue caused by duplicate WASM instantiations

## 0.11.1

### Patch Changes

- 4039682: Fixes hoist script tracking when passed a variable

## 0.11.0

### Minor Changes

- f5d4006: Switch from TinyGo to Go's built-in WASM output. While this is an unfortunate size increase for our `.wasm` file, it should also be significantly more stable and cut down on hard-to-reproduce bugs.

  Please see https://github.com/withastro/compiler/pull/291 for more details.

## 0.11.0-next--wasm.0

### Minor Changes

- 9212ccc: Switch from TinyGo to Go's built-in WASM output. While this is an unfortunate size increase for our `WASM` file, it should also be significantly more stable and cut down on hard-to-reproduce bugs.

  Please see https://github.com/withastro/compiler/pull/291 for more details.

## 0.10.2

### Patch Changes

- 7f7c65c: Fix conditional rendering for special elements like `iframe` and `noscript`
- 9d789c9: Fix handling of nested template literals inside of expressions
- 5fa9e53: Fix handling of special characters inside of expressions
- 8aaa956: Formalize support for magic `data-astro-raw` attribute with new, official `is:raw` directive
- c698350: Improve MathML support. `{}` inside of `<math>` is now treated as raw text rather than an expression construct.

## 0.10.1

### Patch Changes

- 38ae39a: Add support for `set:html` and `set:text` directives, as designed in the [`set:html` RFC](https://github.com/withastro/rfcs/blob/main/active-rfcs/0000-set-html.md).

## 0.10.0

### Minor Changes

- 02d41a8: Adds support for `Astro.self` (as accepted in the [Recursive Components RFC](https://github.com/withastro/rfcs/blob/main/active-rfcs/0000-recursive-components.md)).

### Patch Changes

- 4fe522b: Fixes inclusion of define:vars scripts/styles using the StaticExtraction flag

## 0.9.2

### Patch Changes

- 92cc76b: Fix wasm build for use in Astro

## 0.9.1

### Patch Changes

- 85d35a5: Revert previous change that broke Windows

## 0.9.0

### Minor Changes

- c1a0172: changing raw_with_expression_loop in tokenizer to only handle string that has '`' differently otherwise it should treat it as normal string

### Patch Changes

- 1fa2162: Improved types for TransformResult with hoisted scripts

## 0.8.2

### Patch Changes

- 502f8b8: Adds a new property, `scripts`, to `TransformResult`

## 0.8.1

### Patch Changes

- cd277e2: Fix bug with data-astro-raw detection

## 0.8.0

### Minor Changes

- 3690968: Passes the Pathname to createAstro instead of import.meta.url

## 0.7.4

### Patch Changes

- afc1e82: Remove console log (sorry!)

## 0.7.3

### Patch Changes

- cc24069: Fix some edge cases with expressions inside of `<table>` elements
- 086275c: Fix edge case with textarea inside expression

## 0.7.2

### Patch Changes

- 899e48d: Fix issue with active formatting elements by marking expressions as unique scopes

## 0.7.1

### Patch Changes

- fa039dd: Fix tokenization of attribute expression containing the solidus (`/`) character
- e365c3c: Fix bug with expressions inside of <table> elements (without reverting a previous fix to expressions inside of <a> elements)
- 7c5889f: Fix bug with `@keyframes` scoping
- df74ab3: Fix bug where named grid columns (like `[content-start]`) would be scoped, producing invalid CSS
- abe37ca: Fix handling of components and expressions inside of `<noscript>`
- 8961cf4: Fix a logical error with expression tokenization when using nested functions. Previously, only the first brace pair would be respected and following pairs would be treated as expression boundaries.

## 0.7.0

### Minor Changes

- 43cbac3: Adds metadata on hydration directives used by the component

## 0.6.2

### Patch Changes

- e785310: Fix issue with import assertions creating additional imports

## 0.6.1

### Patch Changes

- e40ea9c: Include LICENSE information

## 0.6.0

### Minor Changes

- b9e2b4b: Adds option to make CSS be extracted statically

## 0.5.7

### Patch Changes

- 75bd730: Fix regression with Components mixed with active formatting elements

## 0.5.6

### Patch Changes

- 7ca419e: Improve behavior of empty expressions in body and attributes, where `{}` is equivalent to `{(void 0)}`

## 0.5.5

### Patch Changes

- 7a41d7b: Fix `<>` syntax edge case inside of expressions
- b0d35b9: Fix edge case with conditional scripts

## 0.5.4

### Patch Changes

- f2e0322: Do not reconstruct active formatting elements on expression start
- 0103285: Bugfix: expressions in table context

## 0.5.3

### Patch Changes

- 50cbc57: Fix fragment expression behavior edge case

## 0.5.2

### Patch Changes

- 8f0e3d7: Fix fragment parsing bugs when frontmatter is missing or top-level expressions are present

## 0.5.1

### Patch Changes

- 1f0ba41: Fix bug when fragment parsing frontmatter is missing

## 0.5.0

### Minor Changes

- 901faef: Passes projectRoot to createAstro

## 0.4.0

### Minor Changes

- 7e1aded: Change behavior of `as: "fragment"` option to support arbitrary `head` and `body` tags

## 0.3.9

### Patch Changes

- 2884a82: Bugfix: CSS comments insert semicolon

## 0.3.8

### Patch Changes

- 2c8f5d8: Fix another component-only edge case

## 0.3.7

### Patch Changes

- eb0d17f: Fix edge case with files that contain a single component

## 0.3.6

### Patch Changes

- af003e9: Fix syntax error in transformed output

## 0.3.5

### Patch Changes

- bca7e00: Fixed issue where an Astro Components could only add one style or script
- 2a2f951: Fix regression where leading `<style>` elements could break generated tags
- db162f8: Fix case-sensitivity of void elements
- 44ee189: Fixed issue where expressions did not work within SVG elements
- 9557113: Fix panic when preprocessed style is empty

## 0.3.4

### Patch Changes

- 351f298: Fix edge case with with `textarea` inside of a Component when the document generated an implicit `head` tag
- 0bcfd4b: Fix CSS scoping of \* character inside of calc() expressions
- 4be512f: Encode double quotes inside of quoted attributes
- ad865e5: Fix behavior of expressions inside of <table> elements

## 0.3.3

### Patch Changes

- 6d2a3c2: Fix handling of top-level component nodes with leading styles
- 2ce10c6: Fix "call to released function" issue

## 0.3.2

### Patch Changes

- 8800f80: Fix comments and strings inside of attribute expressions

## 0.3.1

### Patch Changes

- 432eaaf: Fix for compiler regression causing nil pointer

## 0.3.0

### Minor Changes

- 1255477: Drop support for elements inside of Frontmatter, which was undefined behavior that caused lots of TypeScript interop problems

### Patch Changes

- 44dc0c6: Fixes issue with \x00 character on OSX
- d74acfa: Fix regression with expressions inside of <select> elements
- f50ae69: Bugfix: don’t treat import.meta as import statement

## 0.2.27

### Patch Changes

- 460c1e2: Use `$metadata.resolvePath` utility to support the `client:only` directive

## 0.2.26

### Patch Changes

- 3e5ef91: Implement getStaticPaths hoisting
- 8a434f9: Fix namespace handling to support attributes like `xmlns:xlink`

## 0.2.25

### Patch Changes

- 59f36cb: Fix custom-element slot behavior to remain spec compliant
- 79b2e6f: Fix style/script ordering
- 6041ee5: Add support for `client:only` directive
- 2cd35f6: Fix apostrophe handling inside of elements which are inside of expressions ([#1478](https://github.com/snowpackjs/astro/issues/1478))

## 0.2.24

### Patch Changes

- bfd1b94: Fix issue with `style` and `script` processing where siblings would be skipped
- 726d272: Fix <Fragment> and <> handling
- f052465: Fix CSS variable parsing in the scoped CSS transform

## 0.2.23

### Patch Changes

- 632c29b: Fix nil pointer dereference when every element on page is a component
- 105a159: Fix bug where text inside of elements inside of an expression was not read properly (https://github.com/snowpackjs/astro/issues/1617)

## 0.2.22

### Patch Changes

- 04c1b63: Fix bug with dynamic classes

## 0.2.21

### Patch Changes

- 7b46e9f: Revert automatic DOCTYPE injection to fix package

## 0.2.20

### Patch Changes

- 39298e4: Fix small bugs with script/style hoisting behavior
- bd1014a: Bugfix: style tags in SVG

## 0.2.19

### Patch Changes

- 318dd69: Fix handling of self-closing "raw" tags like <script /> and <style />
- 9372c10: Support `define:vars` with root `html` element on pages
- c4491cd: Fix bug with <script define:vars> when not using the `hoist` attribute

## 0.2.18

### Patch Changes

- 2f4b772: Prevents overrunning an array when checking for raw attribute

## 0.2.17

### Patch Changes

- 4f9155a: Bugfix: fix character limit of 4096 characters
- 83df04c: Upgrade to Go 1.17

## 0.2.16

### Patch Changes

- 9ad8da7: Allows a data-astro-raw attr to parse children as raw text
- 61b77de: Bugfix: CSS and selector scoping

## 0.2.15

### Patch Changes

- 8fbae5e: Bugfix: fix component detection bug in parser
- 37b5b6e: Bugfix: wait to release processStyle() until after fn call

## 0.2.14

### Patch Changes

- f59c886: Bugfix: allow for detection of void tags (e.g. <img>)
- 4c8d14a: Fixes textContent containing a forward slash

## 0.2.13

### Patch Changes

- f262b61: Fix for string template usage within expressions

## 0.2.12

### Patch Changes

- c9fa9eb: Fix for apostrophe within elements

## 0.2.11

### Patch Changes

- 27629b2: Reverts the apostrophe change that broke markdown parsing

## 0.2.10

### Patch Changes

- 57eb728: Fixes hydrated scripts not recognized when using fragment transformation

## 0.2.9

### Patch Changes

- 3ea8d8c: Fix for string interpolation within titles
- ef7cb1e: Fixes bug with textContent containing apostrophe character

## 0.2.8

### Patch Changes

- b2d5564: Fixes wasm build

## 0.2.6

### Patch Changes

- fix small issue with `preprocessStyle` handling of `null` or `undefined`

## 0.2.5

### Patch Changes

- Fix issue with CI deployment

## 0.2.4

### Patch Changes

- 4410c5a: Add support for a `preprocessStyle` function
- 934e6a6: Chore: add linting, format code

## 0.1.15

### Patch Changes

- 5c02abf: Fix split so it always splits on first non-import/export
- 93c1cd9: Bugfix: handle RegExp in Astro files
- 94c59fa: Bugfix: tokenizer tries to parse JS comments
- 46a5c75: Adds the top-level Astro object
- 7ab9148: Improve JS scanning algorithm to be more fault tolerant, less error prone

## 0.1.12

### Patch Changes

- 96dc356: Adds hydrationMap support for custom elements

## 0.1.11

### Patch Changes

- 939283d: Adds the component export for use in hydration

## 0.1.10

### Patch Changes

- 3a336ef: Adds a hydration map to enable hydration within Astro components

## 0.1.9

### Patch Changes

- 7d887de: Allows the Astro runtime to create the Astro.slots object

## 0.1.8

### Patch Changes

- d159658: Publish via PR

## 0.1.7

### Patch Changes

- c52e69b: Include astro.wasm in the package

## 0.1.6

### Patch Changes

- bd05f7c: Actually include _any_ files?

## 0.1.5

### Patch Changes

- c4ed69e: Includes the wasm binary in the npm package

## 0.1.4

### Patch Changes

- 2f1f1b8: Pass custom element tag names to renderComponent as strings

## 0.1.3

### Patch Changes

- e4e2de5: Update to [`tinygo@0.20.0`](https://github.com/tinygo-org/tinygo/releases/tag/v0.20.0) and remove `go@1.16.x` restriction.
- ae71546: Add support for `fragment` compilation, to be used with components rather than pages
- 8c2aaf9: Allow multiple top-level conditional expressions

## 0.1.0

### Patch Changes

- c9407cd: Fix for using conditionals at the top-level
