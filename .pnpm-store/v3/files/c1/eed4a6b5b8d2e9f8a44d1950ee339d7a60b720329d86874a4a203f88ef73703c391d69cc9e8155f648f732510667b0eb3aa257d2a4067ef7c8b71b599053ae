/**
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('hast').Properties} Properties
 * @typedef {import('../index.js').Handler} Handler
 */

import {normalizeUri} from 'micromark-util-sanitize-uri'
import {revert} from '../revert.js'
import {all} from '../traverse.js'

/**
 * @type {Handler}
 * @param {LinkReference} node
 */
export function linkReference(h, node) {
  const def = h.definition(node.identifier)

  if (!def) {
    return revert(h, node)
  }

  /** @type {Properties} */
  const props = {href: normalizeUri(def.url || '')}

  if (def.title !== null && def.title !== undefined) {
    props.title = def.title
  }

  return h(node, 'a', props, all(h, node))
}
