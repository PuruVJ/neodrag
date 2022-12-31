/**
 * @typedef {import('mdast').Blockquote} Blockquote
 * @typedef {import('../index.js').Handler} Handler
 */

import {wrap} from '../wrap.js'
import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {Blockquote} node
 */
export function blockquote(h, node) {
  return h(node, 'blockquote', wrap(all(h, node), true))
}
