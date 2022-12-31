/**
 * @typedef {import('mdast').Text} Text
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 */

import {safe} from '../util/safe.js'

/**
 * @param {Text} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function text(node, _, context, safeOptions) {
  return safe(context, node.value, safeOptions)
}
