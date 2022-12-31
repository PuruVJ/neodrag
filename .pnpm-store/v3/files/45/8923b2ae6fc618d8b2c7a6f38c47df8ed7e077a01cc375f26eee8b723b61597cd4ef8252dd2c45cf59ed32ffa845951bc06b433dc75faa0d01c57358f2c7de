/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Parent} Parent
 * @typedef {import('hast').Element} Element
 * @typedef {Element['children'][number]} ElementChild
 * @typedef {import('hast').Properties} Properties
 * @typedef {import('hast-util-is-element').Test} Test
 *
 * @typedef {'prepend'|'append'|'wrap'|'before'|'after'} Behavior
 *
 * @callback Build
 * @param {Element} node
 * @returns {ElementChild|ElementChild[]}
 *
 * @typedef Options
 *   Configuration.
 * @property {Behavior} [behavior='prepend']
 *   How to create links.
 * @property {Behavior} [behaviour]
 *   Please use `behavior` instead
 * @property {Properties} [properties]
 *   Extra properties to set on the link when injecting.
 *   Defaults to `{ariaHidden: true, tabIndex: -1}` when `'prepend'` or
 *   `'append'`.
 * @property {ElementChild|ElementChild[]|Build} [content={type: 'element', tagName: 'span', properties: {className: ['icon', 'icon-link']}, children: []}]
 *   hast nodes to insert in the link.
 * @property {ElementChild|ElementChild[]|Build} [group]
 *   hast node to wrap the heading and link with, if `behavior` is `'before'` or
 *   `'after'`.
 *   There is no default.
 * @property {Test} [test]
 *   Test to define which heading elements are linked.
 *   Any test that can be given to `hast-util-is-element` is supported.
 *   The default (no test) is to link all headings.
 *   Can be used to link only h1-h3, or for example all except h1.
 */

import extend from 'extend'
import {hasProperty} from 'hast-util-has-property'
import {headingRank} from 'hast-util-heading-rank'
import {convertElement} from 'hast-util-is-element'
import {visit, SKIP} from 'unist-util-visit'

/** @type {Element} */
const contentDefaults = {
  type: 'element',
  tagName: 'span',
  properties: {className: ['icon', 'icon-link']},
  children: []
}

/**
 * Plugin to automatically add links to headings (h1-h6).
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
export default function rehypeAutolinkHeadings(options = {}) {
  let props = options.properties
  const behavior = options.behaviour || options.behavior || 'prepend'
  const content = options.content || contentDefaults
  const group = options.group
  const is = convertElement(options.test)

  /** @type {import('unist-util-visit/complex-types').Visitor<Element>} */
  let method

  if (behavior === 'wrap') {
    method = wrap
  } else if (behavior === 'before' || behavior === 'after') {
    method = around
  } else {
    if (!props) {
      props = {ariaHidden: 'true', tabIndex: -1}
    }

    method = inject
  }

  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        headingRank(node) &&
        hasProperty(node, 'id') &&
        is(node, index, parent)
      ) {
        return method(node, index, parent)
      }
    })
  }

  /** @type {import('unist-util-visit/complex-types').Visitor<Element>} */
  function inject(node) {
    node.children[behavior === 'prepend' ? 'unshift' : 'push'](
      create(node, extend(true, {}, props), toChildren(content, node))
    )

    return [SKIP]
  }

  /** @type {import('unist-util-visit/complex-types').Visitor<Element>} */
  function around(node, index, parent) {
    // Uncommon.
    /* c8 ignore next */
    if (typeof index !== 'number' || !parent) return

    const link = create(
      node,
      extend(true, {}, props),
      toChildren(content, node)
    )
    let nodes = behavior === 'before' ? [link, node] : [node, link]

    if (group) {
      const grouping = toNode(group, node)

      if (grouping && !Array.isArray(grouping) && grouping.type === 'element') {
        grouping.children = nodes
        nodes = [grouping]
      }
    }

    parent.children.splice(index, 1, ...nodes)

    return [SKIP, index + nodes.length]
  }

  /** @type {import('unist-util-visit/complex-types').Visitor<Element>} */
  function wrap(node) {
    node.children = [create(node, extend(true, {}, props), node.children)]
    return [SKIP]
  }

  /**
   * @param {ElementChild|ElementChild[]|Build} value
   * @param {Element} node
   * @returns {ElementChild[]}
   */
  function toChildren(value, node) {
    const result = toNode(value, node)
    return Array.isArray(result) ? result : [result]
  }

  /**
   * @param {ElementChild|ElementChild[]|Build} value
   * @param {Element} node
   * @returns {ElementChild|ElementChild[]}
   */
  function toNode(value, node) {
    if (typeof value === 'function') return value(node)
    return extend(true, Array.isArray(value) ? [] : {}, value)
  }

  /**
   * @param {Element} node
   * @param {Properties} props
   * @param {ElementChild[]} children
   * @returns {Element}
   */
  function create(node, props, children) {
    return {
      type: 'element',
      tagName: 'a',
      properties: Object.assign({}, props, {
        // Fix hast types and make them required.
        /* c8 ignore next */
        href: '#' + (node.properties || {}).id
      }),
      children
    }
  }
}
