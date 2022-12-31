/**
 * @typedef {import('mdast').Root|import('mdast').Content} Node
 * @typedef {import('mdast').Definition} Definition
 */

import {visit} from 'unist-util-visit'

const own = {}.hasOwnProperty

/**
 * Find definitions in `node`.
 * Uses CommonMark precedence, which means that earlier definitions are
 * preferred over duplicate later definitions.
 *
 * @param {Node} node
 */
export function definitions(node) {
  /** @type {Record<string, Definition>} */
  const cache = Object.create(null)

  if (!node || !node.type) {
    throw new Error('mdast-util-definitions expected node')
  }

  visit(node, 'definition', (definition) => {
    const id = clean(definition.identifier)
    if (id && !own.call(cache, id)) {
      cache[id] = definition
    }
  })

  return definition

  /**
   * Get a node from the bound definition cache.
   *
   * @param {string} identifier
   * @returns {Definition|null}
   */
  function definition(identifier) {
    const id = clean(identifier)
    return id && own.call(cache, id) ? cache[id] : null
  }
}

/**
 * @param {string} [value]
 * @returns {string}
 */
function clean(value) {
  return String(value || '').toUpperCase()
}
