/**
 * @typedef {import('mdast').Code} Code
 * @typedef {import('hast').Properties} Properties
 * @typedef {import('../index.js').Handler} Handler
 */

import {u} from 'unist-builder'

/**
 * @type {Handler}
 * @param {Code} node
 */
export function code(h, node) {
  const value = node.value ? node.value + '\n' : ''
  // To do: next major, use `node.lang` w/o regex, the splitting’s been going
  // on for years in remark now.
  const lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/)
  /** @type {Properties} */
  const props = {}

  if (lang) {
    props.className = ['language-' + lang]
  }

  const code = h(node, 'code', props, [u('text', value)])

  if (node.meta) {
    code.data = {meta: node.meta}
  }

  return h(node.position, 'pre', [code])
}
