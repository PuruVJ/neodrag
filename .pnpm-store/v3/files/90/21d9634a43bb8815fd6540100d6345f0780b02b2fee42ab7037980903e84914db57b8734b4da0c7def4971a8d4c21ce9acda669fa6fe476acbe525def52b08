/**
 * @typedef {import('unist').Node} Node
 */
/**
 * @template {Node} [Tree=Node]
 * @typedef {import('./complex-types.js').MapFunction<Tree>} MapFunction
 *   Function called with a node, its index, and its parent to produce a new
 *   node.
 */
/**
 * Create a new tree by mapping all nodes with the given function.
 *
 * @template {Node} Tree
 *   Type of input tree.
 * @param {Tree} tree
 *   Tree to map.
 * @param {MapFunction<Tree>} mapFunction
 *   Function called with a node, its index, and its parent to produce a new
 *   node.
 * @returns {Tree}
 *   New mapped tree.
 */
export function map<Tree extends import('unist').Node<import('unist').Data>>(
  tree: Tree,
  mapFunction: import('./complex-types.js').MapFunction<Tree>
): Tree
export type Node = import('unist').Node
/**
 * Function called with a node, its index, and its parent to produce a new
 * node.
 */
export type MapFunction<
  Tree extends import('unist').Node<
    import('unist').Data
  > = import('unist').Node<import('unist').Data>
> = import('./complex-types.js').MapFunction<Tree>
