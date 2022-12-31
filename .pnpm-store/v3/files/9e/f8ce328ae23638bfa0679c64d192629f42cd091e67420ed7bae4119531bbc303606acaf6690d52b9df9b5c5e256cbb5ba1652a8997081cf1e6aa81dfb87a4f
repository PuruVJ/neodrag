/**
 * @typedef {import('mdast').Break} Break
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 */

import {patternInScope} from '../util/pattern-in-scope.js'

/**
 * @param {Break} _
 * @param {Parent|undefined} _1
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function hardBreak(_, _1, context, safeOptions) {
  let index = -1

  while (++index < context.unsafe.length) {
    // If we can’t put eols in this construct (setext headings, tables), use a
    // space instead.
    if (
      context.unsafe[index].character === '\n' &&
      patternInScope(context.stack, context.unsafe[index])
    ) {
      return /[ \t]/.test(safeOptions.before) ? '' : ' '
    }
  }

  return '\\\n'
}
