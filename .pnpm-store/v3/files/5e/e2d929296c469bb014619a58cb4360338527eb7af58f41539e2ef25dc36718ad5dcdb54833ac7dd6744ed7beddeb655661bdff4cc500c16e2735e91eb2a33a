/**
 * Utility to remove positions from a tree
 *
 * @param node The unist tree
 * @param force if `force` is given, uses `delete`, otherwise, sets positions to `undefined`.
 * @returns The same node, but either with `position: undefined` or w/o `position` fields
 */
export const removePosition: (<
  Tree extends import('unist').Node<import('unist').Data>
>(
  tree: Tree,
  force?: false | undefined
) => Tree) &
  (<Tree_1 extends import('unist').Node<import('unist').Data>>(
    tree: Tree_1,
    force: true
  ) => Tree_1)
export type Node = import('unist').Node
