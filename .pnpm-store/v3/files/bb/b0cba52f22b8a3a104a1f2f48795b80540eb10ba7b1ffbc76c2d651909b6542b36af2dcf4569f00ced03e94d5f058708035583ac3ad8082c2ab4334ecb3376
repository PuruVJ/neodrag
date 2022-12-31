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
export function visitChildren<
  Parent extends import('unist').Parent<
    import('unist').Node<import('unist').Data>,
    import('unist').Data
  >
>(visitor: Visitor<Parent>): Visit<Parent>
export type UnistParent = import('unist').Parent
/**
 * Callback called for each `child` in `parent` later given to `visit`.
 */
export type Visitor<
  Parent extends import('unist').Parent<
    import('unist').Node<import('unist').Data>,
    import('unist').Data
  >
> = (node: Parent['children'][number], index: number, parent: Parent) => void
/**
 * Function to call the bound `visitor` for each child in `parent`.
 */
export type Visit<
  Parent extends import('unist').Parent<
    import('unist').Node<import('unist').Data>,
    import('unist').Data
  >
> = (node: Parent) => void
