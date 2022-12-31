/**
 * @typedef {import('unist').Point} Point
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 * @typedef {object & {type: string, position?: Position|undefined}} NodeLike
 */
/**
 * Stringify one point, a position (start and end points), or a node’s
 * positional information.
 *
 * @param {Node|NodeLike|Position|Point|null} [value]
 * @returns {string}
 */
export function stringifyPosition(
  value?:
    | import('unist').Point
    | import('unist').Node<import('unist').Data>
    | import('unist').Position
    | NodeLike
    | null
    | undefined
): string
export type Point = import('unist').Point
export type Node = import('unist').Node
export type Position = import('unist').Position
export type NodeLike = object & {
  type: string
  position?: Position | undefined
}
/**
 * @param {Position|undefined} pos
 * @returns {string}
 */
declare function position(pos: Position | undefined): string
export {}
