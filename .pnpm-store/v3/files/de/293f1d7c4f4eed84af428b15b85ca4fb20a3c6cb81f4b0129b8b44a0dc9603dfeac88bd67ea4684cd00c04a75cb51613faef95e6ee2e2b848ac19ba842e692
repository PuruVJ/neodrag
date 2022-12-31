# micromark-util-events-to-acorn

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][bundle-size-badge]][bundle-size]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

micromark utility to try and parse events w/ acorn.

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`eventsToAcorn(events, options)`](#eventstoacornevents-options)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## Install

[npm][]:

```sh
npm install micromark-util-events-to-acorn
```

## Use

```js
import {eventsToAcorn} from 'micromark-util-events-to-acorn'

// A factory that uses the utility:
/** @type {Tokenizer} */
function factoryMdxExpression(effects, ok, nok) {
  return start

  // …

  /** @type {State} */
  atClosingBrace(code) {
    // …

    // Gnostic mode: parse w/ acorn.
    const result = eventsToAcorn(
      self.events.slice(eventStart),
      acorn,
      acornOptions,
      {
        start: startPosition,
        expression: true,
        allowEmpty,
        prefix: spread ? '({' : '',
        suffix: spread ? '})' : ''
      }
    )

    // …
  }

  // …
}
```

## API

This module exports the following identifiers: `eventsToAcorn`.
There is no default export.

The export map supports the endorsed
[`development` condition](https://nodejs.org/api/packages.html#packages_resolving_user_conditions).
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `eventsToAcorn(events, options)`

###### Parameters

*   `events` (`Array<Event>`) — Events
*   `options.acorn` (`Acorn`, required) — Object with `acorn.parse` and
    `acorn.parseExpressionAt`
*   `options.acornOptions` ([`AcornOptions`][acorn-options]) — Configuration for
    acorn
*   `options.start` (`Point`, optional) — Place where events start
*   `options.prefix` (`string`, default: `''`) — Text to place before events
*   `options.suffix` (`string`, default: `''`) — Text to place after events
*   `options.expression` (`boolean`, default: `false`) — Whether this is a
    program or expression
*   `options.allowEmpty` (`boolean`, default: `false`) — Whether an empty
    expression is allowed (programs are always allowed to be empty).

###### Returns

*   `estree` ([`Program?`][program]) — Estree node
*   `error` (`Error?`) — Error if unparseable
*   `swallow` (`boolean`) — Whether the error, if there is one, can be swallowed
    and more JavaScript could be valid.

## Security

See [`security.md`][securitymd] in [`micromark/.github`][health] for how to
submit a security report.

## Contribute

See [`contributing.md`][contributing] in [`micromark/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-mdx-expression/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-mdx-expression/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-mdx-expression.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-mdx-expression

[downloads-badge]: https://img.shields.io/npm/dm/micromark-util-events-to-acorn.svg

[downloads]: https://www.npmjs.com/package/micromark-util-events-to-acorn

[bundle-size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-util-events-to-acorn.svg

[bundle-size]: https://bundlephobia.com/result?p=micromark-util-events-to-acorn

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[opencollective]: https://opencollective.com/unified

[npm]: https://docs.npmjs.com/cli/install

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[license]: https://github.com/micromark/micromark-extension-mdx-expression/blob/main/license

[author]: https://wooorm.com

[health]: https://github.com/micromark/.github

[securitymd]: https://github.com/micromark/.github/blob/HEAD/security.md

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[program]: https://github.com/estree/estree/blob/master/es2015.md#programs

[acorn-options]: https://github.com/acornjs/acorn/tree/master/acorn#interface
