/**
 * @param {Root} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function root(
  node: Root,
  _: Parent | undefined,
  context: Context,
  safeOptions: SafeOptions
): string
export type Root = import('mdast').Root
export type Content = import('mdast').Content
export type Node = Root | Content
export type Parent = Extract<Node, import('mdast').Parent>
export type Context = import('../types.js').Context
export type SafeOptions = import('../types.js').SafeOptions
