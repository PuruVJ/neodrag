var own = {}.hasOwnProperty

/**
 * Check if `node` has a set `name` property.
 *
 * @param {unknown} node
 * @param {string} name
 * @returns {boolean}
 */
export function hasProperty(node, name) {
  /** @type {unknown} */
  var value =
    name &&
    node &&
    typeof node === 'object' &&
    // @ts-ignore Looks like a node.
    node.type === 'element' &&
    // @ts-ignore Looks like an element.
    node.properties &&
    // @ts-ignore Looks like an element.
    own.call(node.properties, name) &&
    // @ts-ignore Looks like an element.
    node.properties[name]

  return value !== null && value !== undefined && value !== false
}
