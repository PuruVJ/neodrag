/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').Token} Token
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').Exiter} Exiter
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Event} Event
 */

import {ok as assert} from 'uvu/assert'
import {blankLine} from 'micromark-core-commonmark'
import {factorySpace} from 'micromark-factory-space'
import {
  markdownLineEnding,
  markdownLineEndingOrSpace
} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {constants} from 'micromark-util-symbol/constants.js'
import {normalizeIdentifier} from 'micromark-util-normalize-identifier'
import {types} from 'micromark-util-symbol/types.js'

const indent = {tokenize: tokenizeIndent, partial: true}

/**
 * @returns {Extension}
 */
export function gfmFootnote() {
  /** @type {Extension} */
  return {
    document: {
      [codes.leftSquareBracket]: {
        tokenize: tokenizeDefinitionStart,
        continuation: {tokenize: tokenizeDefinitionContinuation},
        exit: gfmFootnoteDefinitionEnd
      }
    },
    text: {
      [codes.leftSquareBracket]: {tokenize: tokenizeGfmFootnoteCall},
      [codes.rightSquareBracket]: {
        add: 'after',
        tokenize: tokenizePotentialGfmFootnoteCall,
        resolveTo: resolveToPotentialGfmFootnoteCall
      }
    }
  }
}

/** @type {Tokenizer} */
function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
  const self = this
  let index = self.events.length
  /** @type {Array<string>} */
  // @ts-expect-error It’s fine!
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
  /** @type {Token} */
  let labelStart

  // Find an opening.
  while (index--) {
    const token = self.events[index][1]

    if (token.type === types.labelImage) {
      labelStart = token
      break
    }

    // Exit if we’ve walked far enough.
    if (
      token.type === 'gfmFootnoteCall' ||
      token.type === types.labelLink ||
      token.type === types.label ||
      token.type === types.image ||
      token.type === types.link
    ) {
      break
    }
  }

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.rightSquareBracket, 'expected `]`')

    if (!labelStart || !labelStart._balanced) {
      return nok(code)
    }

    const id = normalizeIdentifier(
      self.sliceSerialize({start: labelStart.end, end: self.now()})
    )

    if (id.charCodeAt(0) !== codes.caret || !defined.includes(id.slice(1))) {
      return nok(code)
    }

    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    return ok(code)
  }
}

/** @type {Resolver} */
function resolveToPotentialGfmFootnoteCall(events, context) {
  let index = events.length
  /** @type {Token|undefined} */
  let labelStart

  // Find an opening.
  while (index--) {
    if (
      events[index][1].type === types.labelImage &&
      events[index][0] === 'enter'
    ) {
      labelStart = events[index][1]
      break
    }
  }

  assert(labelStart, 'expected `labelStart` to resolve')

  // Change the `labelImageMarker` to a `data`.
  events[index + 1][1].type = types.data
  events[index + 3][1].type = 'gfmFootnoteCallLabelMarker'

  // The whole (without `!`):
  const call = {
    type: 'gfmFootnoteCall',
    start: Object.assign({}, events[index + 3][1].start),
    end: Object.assign({}, events[events.length - 1][1].end)
  }
  // The `^` marker
  const marker = {
    type: 'gfmFootnoteCallMarker',
    start: Object.assign({}, events[index + 3][1].end),
    end: Object.assign({}, events[index + 3][1].end)
  }
  // Increment the end 1 character.
  marker.end.column++
  marker.end.offset++
  marker.end._bufferIndex++
  const string = {
    type: 'gfmFootnoteCallString',
    start: Object.assign({}, marker.end),
    end: Object.assign({}, events[events.length - 1][1].start)
  }
  const chunk = {
    type: types.chunkString,
    contentType: 'string',
    start: Object.assign({}, string.start),
    end: Object.assign({}, string.end)
  }

  /** @type {Array<Event>} */
  const replacement = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    events[index + 1],
    events[index + 2],
    ['enter', call, context],
    // The `[`
    events[index + 3],
    events[index + 4],
    // The `^`.
    ['enter', marker, context],
    ['exit', marker, context],
    // Everything in between.
    ['enter', string, context],
    ['enter', chunk, context],
    ['exit', chunk, context],
    ['exit', string, context],
    // The ending (`]`, properly parsed and labelled).
    events[events.length - 2],
    events[events.length - 1],
    ['exit', call, context]
  ]

  events.splice(index, events.length - index + 1, ...replacement)

  return events
}

/** @type {Tokenizer} */
function tokenizeGfmFootnoteCall(effects, ok, nok) {
  const self = this
  /** @type {Array<string>} */
  // @ts-expect-error It’s fine!
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
  let size = 0
  /** @type {boolean} */
  let data

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.leftSquareBracket, 'expected `[`')
    effects.enter('gfmFootnoteCall')
    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    return callStart
  }

  /** @type {State} */
  function callStart(code) {
    if (code !== codes.caret) return nok(code)

    effects.enter('gfmFootnoteCallMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallMarker')
    effects.enter('gfmFootnoteCallString')
    effects.enter('chunkString').contentType = 'string'
    return callData
  }

  /** @type {State} */
  function callData(code) {
    /** @type {Token} */
    let token

    if (
      code === codes.eof ||
      code === codes.leftSquareBracket ||
      size++ > constants.linkReferenceSizeMax
    ) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket) {
      if (!data) {
        return nok(code)
      }

      effects.exit('chunkString')
      token = effects.exit('gfmFootnoteCallString')
      return defined.includes(normalizeIdentifier(self.sliceSerialize(token)))
        ? end(code)
        : nok(code)
    }

    effects.consume(code)

    if (!markdownLineEndingOrSpace(code)) {
      data = true
    }

    return code === codes.backslash ? callEscape : callData
  }

  /** @type {State} */
  function callEscape(code) {
    if (
      code === codes.leftSquareBracket ||
      code === codes.backslash ||
      code === codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return callData
    }

    return callData(code)
  }

  /** @type {State} */
  function end(code) {
    assert(code === codes.rightSquareBracket, 'expected `]`')
    effects.enter('gfmFootnoteCallLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteCallLabelMarker')
    effects.exit('gfmFootnoteCall')
    return ok
  }
}

/** @type {Tokenizer} */
function tokenizeDefinitionStart(effects, ok, nok) {
  const self = this
  /** @type {Array<string>} */
  // @ts-expect-error It’s fine!
  const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = [])
  /** @type {string} */
  let identifier
  let size = 0
  /** @type {boolean|undefined} */
  let data

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.leftSquareBracket, 'expected `[`')
    effects.enter('gfmFootnoteDefinition')._container = true
    effects.enter('gfmFootnoteDefinitionLabel')
    effects.enter('gfmFootnoteDefinitionLabelMarker')
    effects.consume(code)
    effects.exit('gfmFootnoteDefinitionLabelMarker')
    return labelStart
  }

  /** @type {State} */
  function labelStart(code) {
    if (code === codes.caret) {
      effects.enter('gfmFootnoteDefinitionMarker')
      effects.consume(code)
      effects.exit('gfmFootnoteDefinitionMarker')
      effects.enter('gfmFootnoteDefinitionLabelString')
      return atBreak
    }

    return nok(code)
  }

  /** @type {State} */
  function atBreak(code) {
    /** @type {Token} */
    let token

    if (
      code === codes.eof ||
      code === codes.leftSquareBracket ||
      size > constants.linkReferenceSizeMax
    ) {
      return nok(code)
    }

    if (code === codes.rightSquareBracket) {
      if (!data) {
        return nok(code)
      }

      token = effects.exit('gfmFootnoteDefinitionLabelString')
      identifier = normalizeIdentifier(self.sliceSerialize(token))
      effects.enter('gfmFootnoteDefinitionLabelMarker')
      effects.consume(code)
      effects.exit('gfmFootnoteDefinitionLabelMarker')
      effects.exit('gfmFootnoteDefinitionLabel')
      return labelAfter
    }

    if (markdownLineEnding(code)) {
      effects.enter('lineEnding')
      effects.consume(code)
      effects.exit('lineEnding')
      size++
      return atBreak
    }

    effects.enter('chunkString').contentType = 'string'
    return label(code)
  }

  /** @type {State} */
  function label(code) {
    if (
      code === codes.eof ||
      markdownLineEnding(code) ||
      code === codes.leftSquareBracket ||
      code === codes.rightSquareBracket ||
      size > constants.linkReferenceSizeMax
    ) {
      effects.exit('chunkString')
      return atBreak(code)
    }

    if (!markdownLineEndingOrSpace(code)) {
      data = true
    }

    size++
    effects.consume(code)
    return code === codes.backslash ? labelEscape : label
  }

  /** @type {State} */
  function labelEscape(code) {
    if (
      code === codes.leftSquareBracket ||
      code === codes.backslash ||
      code === codes.rightSquareBracket
    ) {
      effects.consume(code)
      size++
      return label
    }

    return label(code)
  }

  /** @type {State} */
  function labelAfter(code) {
    if (code === codes.colon) {
      effects.enter('definitionMarker')
      effects.consume(code)
      effects.exit('definitionMarker')
      // Any whitespace after the marker is eaten, forming indented code
      // is not possible.
      // No space is also fine, just like a block quote marker.
      return factorySpace(effects, done, 'gfmFootnoteDefinitionWhitespace')
    }

    return nok(code)
  }

  /** @type {State} */
  function done(code) {
    if (!defined.includes(identifier)) {
      defined.push(identifier)
    }

    return ok(code)
  }
}

/** @type {Tokenizer} */
function tokenizeDefinitionContinuation(effects, ok, nok) {
  // Either a blank line, which is okay, or an indented thing.
  return effects.check(blankLine, ok, effects.attempt(indent, ok, nok))
}

/** @type {Exiter} */
function gfmFootnoteDefinitionEnd(effects) {
  effects.exit('gfmFootnoteDefinition')
}

/** @type {Tokenizer} */
function tokenizeIndent(effects, ok, nok) {
  const self = this

  return factorySpace(
    effects,
    afterPrefix,
    'gfmFootnoteDefinitionIndent',
    constants.tabSize + 1
  )

  /** @type {State} */
  function afterPrefix(code) {
    const tail = self.events[self.events.length - 1]
    return tail &&
      tail[1].type === 'gfmFootnoteDefinitionIndent' &&
      tail[2].sliceSerialize(tail[1], true).length === constants.tabSize
      ? ok(code)
      : nok(code)
  }
}
