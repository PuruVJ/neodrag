/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('mdast').Break} Break
 * @typedef {import('../index.js').Handler} Handler
 */

import {u} from 'unist-builder'

/**
 * @type {Handler}
 * @param {Break} node
 * @returns {Array<Element|Text>}
 */
export function hardBreak(h, node) {
  return [h(node, 'br'), u('text', '\n')]
}
