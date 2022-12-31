/**
 * @typedef {import('unist').Point} Point
 * @typedef {import('vfile').VFile} VFile
 *
 * @typedef {Pick<Point, 'line'|'column'>} PositionalPoint
 * @typedef {Required<Point>} FullPoint
 * @typedef {NonNullable<Point['offset']>} Offset
 */
/**
 * Get transform functions for the given `document`.
 *
 * @param {string|Uint8Array|VFile} file
 */
export function location(file: string | Uint8Array | VFile): {
  toPoint: (offset: Offset) => FullPoint
  toOffset: (point: PositionalPoint) => Offset
}
export type Point = import('unist').Point
export type VFile = import('vfile').VFile
export type PositionalPoint = Pick<Point, 'line' | 'column'>
export type FullPoint = Required<Point>
export type Offset = NonNullable<Point['offset']>
