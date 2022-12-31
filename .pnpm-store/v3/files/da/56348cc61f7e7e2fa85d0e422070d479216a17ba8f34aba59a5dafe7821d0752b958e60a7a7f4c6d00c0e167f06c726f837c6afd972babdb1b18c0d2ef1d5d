/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').ConstructRecord} ConstructRecord
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('../matters.js').Options} Options
 * @typedef {import('../matters.js').Matter} Matter
 * @typedef {import('../matters.js').Info} Info
 */

import {markdownLineEnding, markdownSpace} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {types} from 'micromark-util-symbol/types.js'
import {matters} from '../matters.js'

/**
 * Create an extension to support frontmatter (YAML, TOML, and more).
 *
 * @param {Options} [options='yaml'] One preset or matter, or an array of them.
 * @returns {Extension}
 */
export function frontmatter(options) {
  const settings = matters(options)
  /** @type {ConstructRecord} */
  const flow = {}
  let index = -1
  /** @type {Matter} */
  let matter
  /** @type {number} */
  let code

  while (++index < settings.length) {
    matter = settings[index]
    code = fence(matter, 'open').charCodeAt(0)
    if (code in flow) {
      // @ts-expect-error it clearly does exist.
      flow[code].push(parse(matter))
    } else {
      flow[code] = [parse(matter)]
    }
  }

  return {flow}
}

/**
 * @param {Matter} matter
 * @returns {Construct}
 */
function parse(matter) {
  const name = matter.type
  const anywhere = matter.anywhere
  const valueType = name + 'Value'
  const fenceType = name + 'Fence'
  const sequenceType = fenceType + 'Sequence'
  const fenceConstruct = {tokenize: tokenizeFence, partial: true}
  /** @type {string} */
  let buffer

  return {tokenize: tokenizeFrontmatter, concrete: true}

  /** @type {Tokenizer} */
  function tokenizeFrontmatter(effects, ok, nok) {
    const self = this

    return start

    /** @type {State} */
    function start(code) {
      const position = self.now()

      if (position.column !== 1 || (!anywhere && position.line !== 1)) {
        return nok(code)
      }

      effects.enter(name)
      buffer = fence(matter, 'open')
      return effects.attempt(fenceConstruct, afterOpeningFence, nok)(code)
    }

    /** @type {State} */
    function afterOpeningFence(code) {
      buffer = fence(matter, 'close')
      return lineEnd(code)
    }

    /** @type {State} */
    function lineStart(code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        return lineEnd(code)
      }

      effects.enter(valueType)
      return lineData(code)
    }

    /** @type {State} */
    function lineData(code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit(valueType)
        return lineEnd(code)
      }

      effects.consume(code)
      return lineData
    }

    /** @type {State} */
    function lineEnd(code) {
      // Require a closing fence.
      if (code === codes.eof) {
        return nok(code)
      }

      // Can only be an eol.
      effects.enter(types.lineEnding)
      effects.consume(code)
      effects.exit(types.lineEnding)
      return effects.attempt(fenceConstruct, after, lineStart)
    }

    /** @type {State} */
    function after(code) {
      effects.exit(name)
      return ok(code)
    }
  }

  /** @type {Tokenizer} */
  function tokenizeFence(effects, ok, nok) {
    let bufferIndex = 0

    return start

    /** @type {State} */
    function start(code) {
      if (code === buffer.charCodeAt(bufferIndex)) {
        effects.enter(fenceType)
        effects.enter(sequenceType)
        return insideSequence(code)
      }

      return nok(code)
    }

    /** @type {State} */
    function insideSequence(code) {
      if (bufferIndex === buffer.length) {
        effects.exit(sequenceType)

        if (markdownSpace(code)) {
          effects.enter(types.whitespace)
          return insideWhitespace(code)
        }

        return fenceEnd(code)
      }

      if (code === buffer.charCodeAt(bufferIndex++)) {
        effects.consume(code)
        return insideSequence
      }

      return nok(code)
    }

    /** @type {State} */
    function insideWhitespace(code) {
      if (markdownSpace(code)) {
        effects.consume(code)
        return insideWhitespace
      }

      effects.exit(types.whitespace)
      return fenceEnd(code)
    }

    /** @type {State} */
    function fenceEnd(code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit(fenceType)
        return ok(code)
      }

      return nok(code)
    }
  }
}

/**
 * @param {Matter} matter
 * @param {'open'|'close'} prop
 * @returns {string}
 */
function fence(matter, prop) {
  return matter.marker
    ? pick(matter.marker, prop).repeat(3)
    : // @ts-expect-error: They’re mutually exclusive.
      pick(matter.fence, prop)
}

/**
 * @param {Info|string} schema
 * @param {'open'|'close'} prop
 * @returns {string}
 */
function pick(schema, prop) {
  return typeof schema === 'string' ? schema : schema[prop]
}
