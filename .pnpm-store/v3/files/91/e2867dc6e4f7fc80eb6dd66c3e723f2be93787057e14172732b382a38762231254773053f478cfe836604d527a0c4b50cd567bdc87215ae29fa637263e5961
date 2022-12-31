/**
 * Get the positional info of `node`.
 *
 * @param {NodeLike|Node} [node]
 * @returns {Position}
 */
export function position(node?: NodeLike | Node): Position
/**
 * Get the positional info of `node`.
 *
 * @param {NodeLike|Node} [node]
 * @returns {Point}
 */
export function pointStart(node?: NodeLike | Node): Point
/**
 * Get the positional info of `node`.
 *
 * @param {NodeLike|Node} [node]
 * @returns {Point}
 */
export function pointEnd(node?: NodeLike | Node): Point
export type Position = import('unist').Position
export type Node = import('unist').Node
export type NodeLike = Record<string, unknown> & {
  type: string
  position?: PositionLike | undefined
}
export type Point = import('unist').Point
export type PointLike = Partial<Point>
export type PositionLike = {
  start?: PointLike
  end?: PointLike
}
