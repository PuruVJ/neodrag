/**
 * @typedef {import('mdast').Emphasis} Emphasis
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 */

import {checkEmphasis} from '../util/check-emphasis.js'
import {containerPhrasing} from '../util/container-phrasing.js'
import {track} from '../util/track.js'

emphasis.peek = emphasisPeek

// To do: there are cases where emphasis cannot “form” depending on the
// previous or next character of sequences.
// There’s no way around that though, except for injecting zero-width stuff.
// Do we need to safeguard against that?
/**
 * @param {Emphasis} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function emphasis(node, _, context, safeOptions) {
  const marker = checkEmphasis(context)
  const exit = context.enter('emphasis')
  const tracker = track(safeOptions)
  let value = tracker.move(marker)
  value += tracker.move(
    containerPhrasing(node, context, {
      before: value,
      after: marker,
      ...tracker.current()
    })
  )
  value += tracker.move(marker)
  exit()
  return value
}

/**
 * @param {Emphasis} _
 * @param {Parent|undefined} _1
 * @param {Context} context
 * @returns {string}
 */
function emphasisPeek(_, _1, context) {
  return context.options.emphasis || '*'
}
