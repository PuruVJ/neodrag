/**
 * @typedef {import('unist').Parent} UnistParent
 */

/**
 * @template {UnistParent} Parent
 * @callback Visitor
 *   Callback called for each `child` in `parent` later given to `visit`.
 * @param {Parent['children'][number]} node
 *   Child of `parent`.
 * @param {number} index
 *   Position of `child` in `parent`.
 * @param {Parent} parent
 *   Parent node.
 * @returns {void}
 *   Nothing.
 */

/**
 * @template {UnistParent} Parent
 * @callback Visit
 *   Function to call the bound `visitor` for each child in `parent`.
 * @param {Parent} node
 *   Parent node.
 * @returns {void}
 *   Nothing.
 */

/**
 * Wrap `visitor` to be called for each child in the nodes later given to
 * `visit`.
 *
 * @template {UnistParent} Parent
 * @param {Visitor<Parent>} visitor
 *   Callback called for each `child` in `parent` later given to `visit`.
 * @returns {Visit<Parent>}
 *   Function to call the bound `visitor` for each child in `parent`.
 */
export function visitChildren(visitor) {
  return visit

  /** @type {Visit<Parent>} */
  function visit(parent) {
    const children = parent && parent.children
    let index = -1

    if (!children) {
      throw new Error('Missing children in `parent` for `visit`')
    }

    while (++index in children) {
      visitor(children[index], index, parent)
    }
  }
}
