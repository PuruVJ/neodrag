/**
 * @typedef {import('mdast').Table} Table
 * @typedef {import('hast').Element} Element
 * @typedef {import('../index.js').Handler} Handler
 * @typedef {import('../index.js').Content} Content
 */

import {pointStart, pointEnd} from 'unist-util-position'
import {wrap} from '../wrap.js'
import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {Table} node
 */
export function table(h, node) {
  const rows = node.children
  let index = -1
  const align = node.align || []
  /** @type {Array<Element>} */
  const result = []

  while (++index < rows.length) {
    const row = rows[index].children
    const name = index === 0 ? 'th' : 'td'
    /** @type {Array<Content>} */
    const out = []
    let cellIndex = -1
    const length = node.align ? align.length : row.length

    while (++cellIndex < length) {
      const cell = row[cellIndex]
      out.push(
        h(cell, name, {align: align[cellIndex]}, cell ? all(h, cell) : [])
      )
    }

    result[index] = h(rows[index], 'tr', wrap(out, true))
  }

  return h(
    node,
    'table',
    wrap(
      [h(result[0].position, 'thead', wrap([result[0]], true))].concat(
        result[1]
          ? h(
              {
                start: pointStart(result[1]),
                end: pointEnd(result[result.length - 1])
              },
              'tbody',
              wrap(result.slice(1), true)
            )
          : []
      ),
      true
    )
  )
}
