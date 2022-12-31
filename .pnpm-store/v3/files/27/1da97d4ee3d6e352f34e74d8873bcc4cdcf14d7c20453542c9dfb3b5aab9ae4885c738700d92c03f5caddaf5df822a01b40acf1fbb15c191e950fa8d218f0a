/**
 * @typedef {import('mdast').Delete} Delete
 * @typedef {import('../index.js').Handler} Handler
 */

import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {Delete} node
 */
export function strikethrough(h, node) {
  return h(node, 'del', all(h, node))
}
