/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('./index.js').H} H
 */

import {normalizeUri} from 'micromark-util-sanitize-uri'
import {u} from 'unist-builder'
import {all} from './traverse.js'
import {wrap} from './wrap.js'

/**
 * @param {H} h
 * @returns {Element|null}
 */
export function footer(h) {
  let index = -1
  /** @type {Array<ElementContent>} */
  const listItems = []

  while (++index < h.footnoteOrder.length) {
    const def = h.footnoteById[h.footnoteOrder[index].toUpperCase()]

    if (!def) {
      continue
    }

    const content = all(h, def)
    const id = String(def.identifier)
    const safeId = normalizeUri(id.toLowerCase())
    let referenceIndex = 0
    /** @type {Array<ElementContent>} */
    const backReferences = []

    while (++referenceIndex <= h.footnoteCounts[id]) {
      /** @type {Element} */
      const backReference = {
        type: 'element',
        tagName: 'a',
        properties: {
          href:
            '#' +
            h.clobberPrefix +
            'fnref-' +
            safeId +
            (referenceIndex > 1 ? '-' + referenceIndex : ''),
          dataFootnoteBackref: true,
          className: ['data-footnote-backref'],
          ariaLabel: h.footnoteBackLabel
        },
        children: [{type: 'text', value: '↩'}]
      }

      if (referenceIndex > 1) {
        backReference.children.push({
          type: 'element',
          tagName: 'sup',
          children: [{type: 'text', value: String(referenceIndex)}]
        })
      }

      if (backReferences.length > 0) {
        backReferences.push({type: 'text', value: ' '})
      }

      backReferences.push(backReference)
    }

    const tail = content[content.length - 1]

    if (tail && tail.type === 'element' && tail.tagName === 'p') {
      const tailTail = tail.children[tail.children.length - 1]
      if (tailTail && tailTail.type === 'text') {
        tailTail.value += ' '
      } else {
        tail.children.push({type: 'text', value: ' '})
      }

      tail.children.push(...backReferences)
    } else {
      content.push(...backReferences)
    }

    /** @type {Element} */
    const listItem = {
      type: 'element',
      tagName: 'li',
      properties: {id: h.clobberPrefix + 'fn-' + safeId},
      children: wrap(content, true)
    }

    if (def.position) {
      listItem.position = def.position
    }

    listItems.push(listItem)
  }

  if (listItems.length === 0) {
    return null
  }

  return {
    type: 'element',
    tagName: 'section',
    properties: {dataFootnotes: true, className: ['footnotes']},
    children: [
      {
        type: 'element',
        tagName: h.footnoteLabelTagName,
        properties: {
          ...JSON.parse(JSON.stringify(h.footnoteLabelProperties)),
          id: 'footnote-label'
        },
        children: [u('text', h.footnoteLabel)]
      },
      {type: 'text', value: '\n'},
      {
        type: 'element',
        tagName: 'ol',
        properties: {},
        children: wrap(listItems, true)
      },
      {type: 'text', value: '\n'}
    ]
  }
}
