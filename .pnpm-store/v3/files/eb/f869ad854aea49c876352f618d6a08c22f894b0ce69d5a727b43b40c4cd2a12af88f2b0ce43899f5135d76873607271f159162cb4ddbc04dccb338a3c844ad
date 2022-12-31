/**
 * @typedef {import('mdast').FootnoteReference} FootnoteReference
 * @typedef {import('../index.js').Handler} Handler
 */

import {normalizeUri} from 'micromark-util-sanitize-uri'
import {u} from 'unist-builder'

/**
 * @type {Handler}
 * @param {FootnoteReference} node
 */
export function footnoteReference(h, node) {
  const id = String(node.identifier)
  const safeId = normalizeUri(id.toLowerCase())
  const index = h.footnoteOrder.indexOf(id)
  /** @type {number} */
  let counter

  if (index === -1) {
    h.footnoteOrder.push(id)
    h.footnoteCounts[id] = 1
    counter = h.footnoteOrder.length
  } else {
    h.footnoteCounts[id]++
    counter = index + 1
  }

  const reuseCounter = h.footnoteCounts[id]

  return h(node, 'sup', [
    h(
      node.position,
      'a',
      {
        href: '#' + h.clobberPrefix + 'fn-' + safeId,
        id:
          h.clobberPrefix +
          'fnref-' +
          safeId +
          (reuseCounter > 1 ? '-' + reuseCounter : ''),
        dataFootnoteRef: true,
        ariaDescribedBy: 'footnote-label'
      },
      [u('text', String(counter))]
    )
  ])
}
