/**
 * @typedef {import('mdast').Literal} Literal
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-to-markdown/lib/types.js').Options} ToMarkdownExtension
 * @typedef {import('mdast-util-to-markdown/lib/types.js').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown/lib/util/indent-lines.js').Map} Map
 *
 * @typedef {import('micromark-extension-frontmatter/matters.js').Options} Options
 * @typedef {import('micromark-extension-frontmatter/matters.js').Matter} Matter
 * @typedef {import('micromark-extension-frontmatter/matters.js').Info} Info
 */

import {matters} from 'micromark-extension-frontmatter/matters.js'

/**
 * @param {Options} [options]
 * @returns {FromMarkdownExtension}
 */
export function frontmatterFromMarkdown(options) {
  const settings = matters(options)
  /** @type {FromMarkdownExtension['enter']} */
  const enter = {}
  /** @type {FromMarkdownExtension['exit']} */
  const exit = {}
  let index = -1

  while (++index < settings.length) {
    const matter = settings[index]
    enter[matter.type] = opener(matter)
    exit[matter.type] = close
    exit[matter.type + 'Value'] = value
  }

  return {enter, exit}
}

/**
 * @param {Matter} matter
 * @returns {FromMarkdownHandle} enter
 */
function opener(matter) {
  return open
  /** @type {FromMarkdownHandle} */
  function open(token) {
    // @ts-expect-error: custom.
    this.enter({type: matter.type, value: ''}, token)
    this.buffer()
  }
}

/** @type {FromMarkdownHandle} */
function close(token) {
  const data = this.resume()
  // Remove the initial and final eol.
  this.exit(token).value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, '')
}

/** @type {FromMarkdownHandle} */
function value(token) {
  this.config.enter.data.call(this, token)
  this.config.exit.data.call(this, token)
}

/**
 * @param {Options} [options]
 * @returns {ToMarkdownExtension}
 */
export function frontmatterToMarkdown(options) {
  /** @type {ToMarkdownExtension['unsafe']} */
  const unsafe = []
  /** @type {ToMarkdownExtension['handlers']} */
  const handlers = {}
  const settings = matters(options)
  let index = -1

  while (++index < settings.length) {
    const matter = settings[index]
    handlers[matter.type] = handler(matter)
    unsafe.push({atBreak: true, character: fence(matter, 'open').charAt(0)})
  }

  return {unsafe, handlers}
}

/**
 * @param {Matter} matter
 * @returns {(node: Literal) => string} enter
 */
function handler(matter) {
  const open = fence(matter, 'open')
  const close = fence(matter, 'close')

  return handle

  /**
   * @type {ToMarkdownHandle}
   * @param {Literal} node
   */
  function handle(node) {
    return open + (node.value ? '\n' + node.value : '') + '\n' + close
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
