/**
 * @typedef {import('unist').Node} Node
 */

import {visit} from 'unist-util-visit'

/**
 * Utility to remove positions from a tree
 *
 * @param node The unist tree
 * @param force if `force` is given, uses `delete`, otherwise, sets positions to `undefined`.
 * @returns The same node, but either with `position: undefined` or w/o `position` fields
 */
export const removePosition =
  /**
   * @type {(
   *   (<Tree extends Node>(tree: Tree, force?: false) => Tree) &
   *   (<Tree extends Node>(tree: Tree, force: true) => Tree)
   * )}
   */
  (
    /**
     * @template {Node} Tree
     * @param {Tree} node
     * @param {boolean} [force=false]
     * @returns {Tree}
     */
    function (node, force) {
      visit(node, remove)

      // @ts-ignore hush TS, we know what we’re doing.
      return node

      /**
       * @param {Node} node the unist tree
       */
      function remove(node) {
        if (force) {
          delete node.position
        } else {
          node.position = undefined
        }
      }
    }
  )
