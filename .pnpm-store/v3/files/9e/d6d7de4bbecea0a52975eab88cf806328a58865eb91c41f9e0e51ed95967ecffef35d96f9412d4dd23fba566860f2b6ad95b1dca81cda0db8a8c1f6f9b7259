/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 */

import {containerFlow} from '../util/container-flow.js'

/**
 * @param {Root} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function root(node, _, context, safeOptions) {
  return containerFlow(node, context, safeOptions)
}
