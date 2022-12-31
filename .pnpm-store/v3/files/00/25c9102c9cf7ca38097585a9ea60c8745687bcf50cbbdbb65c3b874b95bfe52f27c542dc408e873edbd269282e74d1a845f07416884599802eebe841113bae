/**
 * @typedef {import('mdast').Strong} Strong
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('mdast').Parent>} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').SafeOptions} SafeOptions
 */

import {checkStrong} from '../util/check-strong.js'
import {containerPhrasing} from '../util/container-phrasing.js'
import {track} from '../util/track.js'

strong.peek = strongPeek

// To do: there are cases where emphasis cannot “form” depending on the
// previous or next character of sequences.
// There’s no way around that though, except for injecting zero-width stuff.
// Do we need to safeguard against that?
/**
 * @param {Strong} node
 * @param {Parent|undefined} _
 * @param {Context} context
 * @param {SafeOptions} safeOptions
 * @returns {string}
 */
export function strong(node, _, context, safeOptions) {
  const marker = checkStrong(context)
  const exit = context.enter('strong')
  const tracker = track(safeOptions)
  let value = tracker.move(marker + marker)
  value += tracker.move(
    containerPhrasing(node, context, {
      before: value,
      after: marker,
      ...tracker.current()
    })
  )
  value += tracker.move(marker + marker)
  exit()
  return value
}

/**
 * @param {Strong} _
 * @param {Parent|undefined} _1
 * @param {Context} context
 * @returns {string}
 */
function strongPeek(_, _1, context) {
  return context.options.strong || '*'
}
