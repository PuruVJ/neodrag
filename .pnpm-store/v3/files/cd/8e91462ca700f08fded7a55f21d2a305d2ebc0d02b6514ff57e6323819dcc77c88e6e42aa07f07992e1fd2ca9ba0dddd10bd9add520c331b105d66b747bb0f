/**
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('../index.js').Handler} Handler
 */

import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {Heading} node
 */
export function heading(h, node) {
  return h(node, 'h' + node.depth, all(h, node))
}
