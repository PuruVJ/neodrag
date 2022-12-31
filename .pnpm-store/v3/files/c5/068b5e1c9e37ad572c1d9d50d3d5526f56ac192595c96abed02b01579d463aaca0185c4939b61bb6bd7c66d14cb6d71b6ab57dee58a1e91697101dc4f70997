/**
 * @typedef {Object} PointLike
 * @property {number} [line]
 * @property {number} [column]
 * @property {number} [offset]
 *
 * @typedef {Object} PositionLike
 * @property {PointLike} [start]
 * @property {PointLike} [end]
 *
 * @typedef {Object} NodeLike
 * @property {PositionLike} [position]
 */
/**
 * Check if `node` is *generated*.
 *
 * @param {NodeLike} [node]
 * @returns {boolean}
 */
export function generated(node?: NodeLike): boolean
export type PointLike = {
  line?: number
  column?: number
  offset?: number
}
export type PositionLike = {
  start?: PointLike
  end?: PointLike
}
export type NodeLike = {
  position?: PositionLike
}
