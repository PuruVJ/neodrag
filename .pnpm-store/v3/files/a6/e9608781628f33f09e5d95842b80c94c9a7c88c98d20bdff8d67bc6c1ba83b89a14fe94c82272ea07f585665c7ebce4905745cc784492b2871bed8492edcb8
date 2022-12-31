/**
 * @typedef {import('mdast').InlineCode} InlineCode
 * @typedef {import('../index.js').Handler} Handler
 */

import {u} from 'unist-builder'

/**
 * @type {Handler}
 * @param {InlineCode} node
 */
export function inlineCode(h, node) {
  return h(node, 'code', [u('text', node.value.replace(/\r?\n|\r/g, ' '))])
}
