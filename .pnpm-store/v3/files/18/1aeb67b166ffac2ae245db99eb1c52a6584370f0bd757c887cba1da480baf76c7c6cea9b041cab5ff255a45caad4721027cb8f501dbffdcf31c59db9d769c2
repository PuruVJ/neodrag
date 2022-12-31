/**
 * @type {Handler}
 * @param {MdastNode} node
 */
export function one(
  h: import('./index.js').H,
  node: MdastNode,
  parent: import('mdast').Parent | null
):
  | import('hast').ElementContent
  | import('hast').ElementContent[]
  | null
  | undefined
/**
 * @param {H} h
 * @param {MdastNode} parent
 */
export function all(h: H, parent: MdastNode): import('hast').ElementContent[]
export type MdastNode =
  | import('mdast').Root
  | import('mdast').Parent['children'][number]
export type H = import('./index.js').H
export type Handler = import('./index.js').Handler
export type Content = import('./index.js').Content
