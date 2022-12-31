/**
 * @typedef {import('nlcst').Content} Content
 * @typedef {import('nlcst').Root} Root
 */

/**
 * Stringify one nlcst node or list of nodes.
 *
 * @param {Root|Content|Content[]} node
 * @param {string} [separator='']
 * @returns {string}
 */
export function toString(node, separator = '') {
  let index = -1

  if (!node || (!Array.isArray(node) && !node.type)) {
    throw new Error('Expected node, not `' + node + '`')
  }

  // @ts-expect-error Looks like a literal.
  if (typeof node.value === 'string') return node.value

  /** @type {Array.<Content|Root>} */
  // @ts-expect-error Looks like a list of nodes or parent.
  const children = (Array.isArray(node) ? node : node.children) || []

  // Shortcut: This is pretty common, and a small performance win.
  if (children.length === 1 && 'value' in children[0]) {
    return children[0].value
  }

  /** @type {Array.<string>} */
  const values = []

  while (++index < children.length) {
    values[index] = toString(children[index], separator)
  }

  return values.join(separator)
}
