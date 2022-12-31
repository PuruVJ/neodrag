/**
 * @typedef {import('parse5').Node} P5Node
 * @typedef {import('parse5').Document} P5Document
 * @typedef {import('parse5').DocumentFragment} P5Fragment
 * @typedef {import('parse5').DocumentType} P5Doctype
 * @typedef {import('parse5').CommentNode} P5Comment
 * @typedef {import('parse5').TextNode} P5Text
 * @typedef {import('parse5').Element} P5Element
 * @typedef {import('parse5').Attribute} P5Attribute
 * @typedef {import('parse5').ParentNode} P5Parent
 * @typedef {Exclude<P5Node, P5Document|P5Fragment>} P5Child
 * @typedef {import('property-information').Schema} Schema
 * @typedef {import('property-information').Info} Info
 * @typedef {'html'|'svg'} Space
 * @typedef {import('hast').Parent} Parent
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').DocType} Doctype
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('hast').Comment} Comment
 * @typedef {Parent['children'][number]} Child
 * @typedef {Child|Root} Node
 *
 * @callback Handle
 * @param {Node} node
 * @param {Schema} schema
 * @returns {P5Node}
 */

import {html, svg, find} from 'property-information'
import {toH} from 'hast-to-hyperscript'
import {webNamespaces} from 'web-namespaces'
import {zwitch} from 'zwitch'

var own = {}.hasOwnProperty

var one = zwitch('type', {handlers: {root, element, text, comment, doctype}})

/**
 * Transform a tree from hast to Parse5’s AST.
 *
 * @param {Node} tree
 * @param {Space} [space='html']
 * @returns {P5Node}
 */
export function toParse5(tree, space) {
  // @ts-ignore Types are wrong.
  return one(tree, space === 'svg' ? svg : html)
}

/**
 * @type {Handle}
 * @param {Root} node
 * @returns {P5Document}
 */
function root(node, schema) {
  /** @type {P5Document} */
  var p5 = {
    nodeName: '#document',
    mode: (node.data || {}).quirksMode ? 'quirks' : 'no-quirks',
    childNodes: []
  }
  // @ts-ignore Assume correct children.
  p5.childNodes = all(node.children, p5, schema)
  return patch(node, p5)
}

/**
 * @type {Handle}
 * @param {Root} node
 * @returns {P5Fragment}
 */
function fragment(node, schema) {
  /** @type {P5Fragment} */
  var p5 = {nodeName: '#document-fragment', childNodes: []}
  // @ts-ignore Assume correct children.
  p5.childNodes = all(node.children, p5, schema)
  return patch(node, p5)
}

/**
 * @type {Handle}
 * @param {Doctype} node
 * @returns {P5Doctype}
 */
function doctype(node) {
  return patch(node, {
    nodeName: '#documentType',
    name: 'html',
    publicId: '',
    systemId: '',
    parentNode: undefined
  })
}

/**
 * @type {Handle}
 * @param {Text} node
 * @returns {P5Text}
 */
function text(node) {
  return patch(node, {
    nodeName: '#text',
    value: node.value,
    parentNode: undefined
  })
}

/**
 * @type {Handle}
 * @param {Comment} node
 * @returns {P5Comment}
 */
function comment(node) {
  return patch(node, {
    nodeName: '#comment',
    data: node.value,
    parentNode: undefined
  })
}

/**
 * @type {Handle}
 * @param {Element} node
 * @returns {P5Element}
 */
function element(node, schema) {
  /** @type {Space} */
  // @ts-ignore Assume space.
  var space = schema.space
  return toH(h, Object.assign({}, node, {children: []}), {space})

  /**
   * @param {string} name
   * @param {Object.<string, string|boolean|number>} attrs
   */
  function h(name, attrs) {
    /** @type {Array.<P5Attribute>} */
    var values = []
    /** @type {Info} */
    var info
    /** @type {P5Attribute} */
    var value
    /** @type {string} */
    var key
    /** @type {number} */
    var index
    /** @type {P5Element} */
    var p5

    for (key in attrs) {
      if (!own.call(attrs, key) || attrs[key] === false) {
        continue
      }

      info = find(schema, key)

      if (info.boolean && !attrs[key]) {
        continue
      }

      value = {name: key, value: attrs[key] === true ? '' : String(attrs[key])}

      if (info.space && info.space !== 'html' && info.space !== 'svg') {
        index = key.indexOf(':')

        if (index < 0) {
          value.prefix = ''
        } else {
          value.name = key.slice(index + 1)
          value.prefix = key.slice(0, index)
        }

        value.namespace = webNamespaces[info.space]
      }

      values.push(value)
    }

    if (schema.space === 'html' && node.tagName === 'svg') schema = svg

    p5 = patch(node, {
      nodeName: name,
      tagName: name,
      attrs: values,
      namespaceURI: webNamespaces[schema.space],
      childNodes: [],
      parentNode: undefined
    })

    // @ts-ignore Assume correct children.
    p5.childNodes = all(node.children, p5, schema)

    // @ts-ignore Types are wrong.
    if (name === 'template') p5.content = fragment(node.content, schema)

    return p5
  }
}

/**
 * @param {Array.<Child>} children
 * @param {P5Parent} p5
 * @param {Schema} schema
 * @returns {Array.<P5Child>}
 */
function all(children, p5, schema) {
  var index = -1
  /** @type {Array.<P5Child>} */
  var result = []
  /** @type {P5Child} */
  var child

  if (children) {
    while (++index < children.length) {
      // @ts-ignore Assume child.
      child = one(children[index], schema)

      // @ts-ignore types are wrong.
      child.parentNode = p5

      result.push(child)
    }
  }

  return result
}

/**
 * Patch specific properties.
 *
 * @template {P5Node} T
 * @param {Node} node
 * @param {T} p5
 * @returns {T}
 */
function patch(node, p5) {
  var position = node.position

  if (position && position.start && position.end) {
    // @ts-ignore Types are wrong.
    p5.sourceCodeLocation = {
      startLine: position.start.line,
      startCol: position.start.column,
      startOffset: position.start.offset,
      endLine: position.end.line,
      endCol: position.end.column,
      endOffset: position.end.offset
    }
  }

  return p5
}
