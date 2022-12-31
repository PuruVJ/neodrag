/**
 * @typedef {import('mdast').Emphasis} Emphasis
 * @typedef {import('../index.js').Handler} Handler
 */

import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {Emphasis} node
 */
export function emphasis(h, node) {
  return h(node, 'em', all(h, node))
}
