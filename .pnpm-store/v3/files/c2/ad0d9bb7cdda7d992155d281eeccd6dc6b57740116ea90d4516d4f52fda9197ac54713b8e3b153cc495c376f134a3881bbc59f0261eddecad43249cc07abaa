/**
 * @typedef {import('mdast').Text} Text
 * @typedef {import('../index.js').Handler} Handler
 */

import {trimLines} from 'trim-lines'
import {u} from 'unist-builder'

/**
 * @type {Handler}
 * @param {Text} node
 */
export function text(h, node) {
  return h.augment(node, u('text', trimLines(String(node.value))))
}
