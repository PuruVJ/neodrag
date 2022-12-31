/**
 * Find definitions in `node`.
 * Uses CommonMark precedence, which means that earlier definitions are
 * preferred over duplicate later definitions.
 *
 * @param {Node} node
 */
export function definitions(
  node: Node
): (identifier: string) => Definition | null
export type Node = import('mdast').Root | import('mdast').Content
export type Definition = import('mdast').Definition
