/**
 * @typedef {import('mdast').List} List
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Properties} Properties
 * @typedef {import('../index.js').Handler} Handler
 */

import {wrap} from '../wrap.js'
import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {List} node
 * @returns {Element}
 */
export function list(h, node) {
  /** @type {Properties} */
  const props = {}
  const name = node.ordered ? 'ol' : 'ul'
  const items = all(h, node)
  let index = -1

  if (typeof node.start === 'number' && node.start !== 1) {
    props.start = node.start
  }

  // Like GitHub, add a class for custom styling.
  while (++index < items.length) {
    const item = items[index]

    if (
      item.type === 'element' &&
      item.tagName === 'li' &&
      item.properties &&
      Array.isArray(item.properties.className) &&
      item.properties.className.includes('task-list-item')
    ) {
      props.className = ['contains-task-list']
      break
    }
  }

  return h(node, name, props, wrap(items, true))
}
