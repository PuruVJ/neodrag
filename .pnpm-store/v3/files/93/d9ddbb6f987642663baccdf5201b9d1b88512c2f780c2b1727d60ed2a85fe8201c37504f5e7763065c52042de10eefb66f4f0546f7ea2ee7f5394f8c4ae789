/**
 * @typedef {import('./index.js').Content} Content
 */

import {u} from 'unist-builder'

/**
 * Wrap `nodes` with line feeds between each entry.
 * Optionally adds line feeds at the start and end.
 *
 * @param {Array<Content>} nodes
 * @param {boolean} [loose=false]
 * @returns {Array<Content>}
 */
export function wrap(nodes, loose) {
  /** @type {Array<Content>} */
  const result = []
  let index = -1

  if (loose) {
    result.push(u('text', '\n'))
  }

  while (++index < nodes.length) {
    if (index) result.push(u('text', '\n'))
    result.push(nodes[index])
  }

  if (loose && nodes.length > 0) {
    result.push(u('text', '\n'))
  }

  return result
}
