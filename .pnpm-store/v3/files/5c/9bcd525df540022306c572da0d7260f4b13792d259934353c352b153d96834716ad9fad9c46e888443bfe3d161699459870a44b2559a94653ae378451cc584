/**
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 */

import {association} from '../util/association.js'
import {containerPhrasing} from '../util/container-phrasing.js'
import {safe} from '../util/safe.js'
import {track} from '../util/track.js'

linkReference.peek = linkReferencePeek

/**
 * @param {LinkReference} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function linkReference(node, _, context, safeOptions) {
  const type = node.referenceType
  const exit = context.enter('linkReference')
  let subexit = context.enter('label')
  const tracker = track(safeOptions)
  let value = tracker.move('[')
  const text = containerPhrasing(node, context, {
    before: value,
    after: ']',
    ...tracker.current()
  })
  value += tracker.move(text + '][')

  subexit()
  // Hide the fact that we’re in phrasing, because escapes don’t work.
  const stack = context.stack
  context.stack = []
  subexit = context.enter('reference')
  // Note: for proper tracking, we should reset the output positions when we end
  // up making a `shortcut` reference, because then there is no brace output.
  // Practically, in that case, there is no content, so it doesn’t matter that
  // we’ve tracked one too many characters.
  const reference = safe(context, association(node), {
    before: value,
    after: ']',
    ...tracker.current()
  })
  subexit()
  context.stack = stack
  exit()

  if (type === 'full' || !text || text !== reference) {
    value += tracker.move(reference + ']')
  } else if (type === 'shortcut') {
    // Remove the unwanted `[`.
    value = value.slice(0, -1)
  } else {
    value += tracker.move(']')
  }

  return value
}

/**
 * @returns {string}
 */
function linkReferencePeek() {
  return '['
}
