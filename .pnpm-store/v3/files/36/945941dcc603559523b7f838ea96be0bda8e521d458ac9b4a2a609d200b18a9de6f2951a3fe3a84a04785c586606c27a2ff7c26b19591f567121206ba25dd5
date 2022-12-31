/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Handle} Handle
 * @typedef {import('../matters.js').Options} Options
 */
import {matters} from '../matters.js'
/**
 * Create an extension to support frontmatter (YAML, TOML, and more).
 *
 * @param {Options} [options='yaml'] One preset or matter, or an array of them.
 * @returns {HtmlExtension}
 */

export function frontmatterHtml(options) {
  const settings = matters(options)
  /** @type {HtmlExtension['enter']} */

  const enter = {}
  /** @type {HtmlExtension['exit']} */

  const exit = {}
  let index = -1

  while (++index < settings.length) {
    const type = settings[index].type
    enter[type] = start
    exit[type] = end
  }

  return {
    enter,
    exit
  }
  /** @type {Handle} */

  function start() {
    this.buffer()
  }
  /** @type {Handle} */

  function end() {
    this.resume()
    this.setData('slurpOneLineEnding', true)
  }
}
