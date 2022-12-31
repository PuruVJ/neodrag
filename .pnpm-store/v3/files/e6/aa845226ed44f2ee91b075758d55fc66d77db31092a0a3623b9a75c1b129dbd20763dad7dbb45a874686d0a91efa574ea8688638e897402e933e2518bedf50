/**
 * @typedef {'yaml'|'toml'} Preset
 *   Either `'yaml'` or `'toml'`
 *
 * @typedef Info
 * @property {string} open
 * @property {string} close
 *
 * @typedef MatterProps
 * @property {string} type
 *   Type to tokenize as
 * @property {boolean} [anywhere=false]
 *   If `true`, matter can be found anywhere in the document.
 *   If `false` (default), only matter at the start of the document is
 *   recognized.
 *
 * @typedef MarkerProps
 * @property {string|Info} marker
 *   Character used to construct fences.
 *   By providing an object with `open` and `close` different characters can be
 *   used for opening and closing fences.
 *   For example the character `'-'` will result in `'---'` being used as the
 *   fence
 * @property {never} [fence]
 *
 * @typedef FenceProps
 * @property {string|Info} fence
 *   String used as the complete fence.
 *   By providing an object with `open` and `close` different values can be used
 *   for opening and closing fences.
 *   This can be used too if fences contain different characters or lengths
 *   other than 3.
 * @property {never} [marker]
 *
 * @typedef {(MatterProps & FenceProps)|(MatterProps & MarkerProps)} Matter
 *
 * @typedef {Preset|Matter|Array.<Preset|Matter>} Options
 */

import {fault} from 'fault'

const own = {}.hasOwnProperty
const markers = {yaml: '-', toml: '+'}

/**
 * @param {Options} [options='yaml']
 * @returns {Array<Matter>}
 */
export function matters(options = 'yaml') {
  /** @type {Array<Matter>} */
  const results = []
  let index = -1

  // One preset or matter.
  if (!Array.isArray(options)) {
    options = [options]
  }

  while (++index < options.length) {
    results[index] = matter(options[index])
  }

  return results
}

/**
 * @param {Preset|Matter} option
 * @returns {Matter}
 */
function matter(option) {
  let result = option

  if (typeof result === 'string') {
    if (!own.call(markers, result)) {
      throw fault('Missing matter definition for `%s`', result)
    }

    result = {type: result, marker: markers[result]}
  } else if (typeof result !== 'object') {
    throw fault('Expected matter to be an object, not `%j`', result)
  }

  if (!own.call(result, 'type')) {
    throw fault('Missing `type` in matter `%j`', result)
  }

  if (!own.call(result, 'fence') && !own.call(result, 'marker')) {
    throw fault('Missing `marker` or `fence` in matter `%j`', result)
  }

  return result
}
