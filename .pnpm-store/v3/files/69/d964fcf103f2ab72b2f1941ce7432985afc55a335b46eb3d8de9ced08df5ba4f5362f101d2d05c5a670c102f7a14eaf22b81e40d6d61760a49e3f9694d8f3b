/**
 * @typedef {import('mdast').HTML} HTML
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 */

html.peek = htmlPeek

/**
 * @param {HTML} node
 * @returns {string}
 */
export function html(node) {
  return node.value || ''
}

/**
 * @returns {string}
 */
function htmlPeek() {
  return '<'
}
