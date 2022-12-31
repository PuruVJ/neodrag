/**
 * @typedef {import('unist').Parent} UnistParent
 * @typedef {import('unist').Node} UnistNode
 */

/**
 * @template {UnistParent} Parent
 * @callback Modifier
 *   Callback called for each `child` in `parent` later given to `modify`.
 * @param {Parent['children'][number]} node
 *   Child of `parent`.
 * @param {number} index
 *   Position of `child` in `parent`.
 * @param {Parent} parent
 *   Parent node.
 * @returns {number|void}
 *   Position to move to next.
 */

/**
 * @template {UnistParent} Parent
 * @callback Modify
 *   Modify children of `parent`.
 * @param {Parent} node
 *   Parent node.
 * @returns {void}
 *   Nothing.
 */

import {arrayIterate} from 'array-iterate'

/**
 * Wrap `modifier` to be called for each child in the nodes later given to
 * `modify`.
 *
 * @template {UnistParent} Parent
 * @param {Modifier<Parent>} modifier
 *   Callback called for each `child` in `parent` later given to `modify`.
 * @returns {Modify<Parent>}
 *   Modify children of `parent`.
 */
export function modifyChildren(modifier) {
  return modify

  /** @type {Modify<UnistParent>} */
  function modify(parent) {
    if (!parent || !parent.children) {
      throw new Error('Missing children in `parent` for `modifier`')
    }

    arrayIterate(parent.children, iteratee, parent)
  }

  /**
   * Pass the context as the third argument to `modifier`.
   *
   * @this {Parent}
   * @param {UnistNode} node
   * @param {number} index
   */
  function iteratee(node, index) {
    return modifier(node, index, this)
  }
}
