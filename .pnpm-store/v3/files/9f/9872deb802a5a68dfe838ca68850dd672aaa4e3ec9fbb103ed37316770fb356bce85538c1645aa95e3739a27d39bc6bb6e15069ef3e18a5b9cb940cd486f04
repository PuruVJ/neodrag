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
export function modifyChildren<
  Parent extends import('unist').Parent<
    import('unist').Node<import('unist').Data>,
    import('unist').Data
  >
>(modifier: Modifier<Parent>): Modify<Parent>
export type UnistParent = import('unist').Parent
export type UnistNode = import('unist').Node
/**
 * Callback called for each `child` in `parent` later given to `modify`.
 */
export type Modifier<
  Parent extends import('unist').Parent<
    import('unist').Node<import('unist').Data>,
    import('unist').Data
  >
> = (
  node: Parent['children'][number],
  index: number,
  parent: Parent
) => number | void
/**
 * Modify children of `parent`.
 */
export type Modify<
  Parent extends import('unist').Parent<
    import('unist').Node<import('unist').Data>,
    import('unist').Data
  >
> = (node: Parent) => void
