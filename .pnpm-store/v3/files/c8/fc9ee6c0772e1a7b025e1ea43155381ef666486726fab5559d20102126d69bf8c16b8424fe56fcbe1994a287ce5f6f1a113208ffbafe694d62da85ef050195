/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../index.js').Handler} Handler
 */

import {u} from 'unist-builder'
import {all} from '../traverse.js'
import {wrap} from '../wrap.js'

/**
 * @type {Handler}
 * @param {Root} node
 */
export function root(h, node) {
  // @ts-expect-error `root`s are also fine.
  return h.augment(node, u('root', wrap(all(h, node))))
}
