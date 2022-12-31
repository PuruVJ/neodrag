/**
 * @typedef {import('mdast').Blockquote} Blockquote
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 * @typedef {import('../util/indent-lines.js').Map} Map
 */

import {containerFlow} from '../util/container-flow.js'
import {indentLines} from '../util/indent-lines.js'
import {track} from '../util/track.js'

/**
 * @param {Blockquote} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function blockquote(node, _, context, safeOptions) {
  const exit = context.enter('blockquote')
  const tracker = track(safeOptions)
  tracker.move('> ')
  tracker.shift(2)
  const value = indentLines(
    containerFlow(node, context, tracker.current()),
    map
  )
  exit()
  return value
}

/** @type {Map} */
function map(line, _, blank) {
  return '>' + (blank ? '' : ' ') + line
}
