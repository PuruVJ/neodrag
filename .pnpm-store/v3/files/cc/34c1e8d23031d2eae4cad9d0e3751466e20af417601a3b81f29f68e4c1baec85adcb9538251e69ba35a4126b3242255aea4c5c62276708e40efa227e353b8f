/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('retext-smartypants').Options} Options
 */

import { retext } from 'retext'
import { visit } from 'unist-util-visit'
import smartypants from 'retext-smartypants'

/**
 * remark plugin to implement SmartyPants.
 *
 * @type {import('unified').Plugin<[Options?] | void[], Root>}
 */
export default function remarkSmartypants(options) {
  const processor = retext().use(smartypants, options)
  const transformer = tree => {
    visit(tree, 'text', node => {
      node.value = String(processor.processSync(node.value))
    })
  }
  return transformer
}
