/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Text} Text
 *
 * @typedef {import('unist-util-is').AssertPredicate<Element>} AssertElement
 * @typedef {import('unist-util-is').AssertPredicate<Text>} AssertText
 * @typedef {import('unist-util-is').AssertPredicate<Root>} AssertRoot
 *
 * @callback CreateElementLike
 * @param {string} name
 * @param {any} attributes
 * @param {Array.<string|any>} [children]
 * @returns {any}
 *
 * @typedef Context
 * @property {html|svg} schema
 * @property {string|null} prefix
 * @property {number} key
 * @property {boolean} react
 * @property {boolean} vue
 * @property {boolean} vdom
 * @property {boolean} hyperscript
 *
 * @typedef Options
 * @property {string|null} [prefix]
 * @property {'html'|'svg'} [space]
 */

import {html, svg, find, hastToReact} from 'property-information'
import {stringify as spaces} from 'space-separated-tokens'
import {stringify as commas} from 'comma-separated-tokens'
import style from 'style-to-object'
import {webNamespaces} from 'web-namespaces'
import {convert} from 'unist-util-is'

const ns = /** @type {Record<string, string>} */ (webNamespaces)
const toReact = /** @type {Record<string, string>} */ (hastToReact)

const own = {}.hasOwnProperty

/** @type {AssertRoot} */
// @ts-expect-error it’s correct.
const root = convert('root')
/** @type {AssertElement} */
// @ts-expect-error it’s correct.
const element = convert('element')
/** @type {AssertText} */
// @ts-expect-error it’s correct.
const text = convert('text')

/**
 * @template {CreateElementLike} H
 * @param {H} h
 * @param {Element|Root} tree
 * @param {string|boolean|Options} [options]
 * @returns {ReturnType<H>}
 */
export function toH(h, tree, options) {
  if (typeof h !== 'function') {
    throw new TypeError('h is not a function')
  }

  const r = react(h)
  const v = vue(h)
  const vd = vdom(h)
  /** @type {string|boolean|null|undefined} */
  let prefix
  /** @type {Element} */
  let node

  if (typeof options === 'string' || typeof options === 'boolean') {
    prefix = options
    options = {}
  } else {
    if (!options) options = {}
    prefix = options.prefix
  }

  if (root(tree)) {
    // @ts-expect-error Allow `doctypes` in there, we’ll filter them out later.
    node =
      tree.children.length === 1 && element(tree.children[0])
        ? tree.children[0]
        : {
            type: 'element',
            tagName: 'div',
            properties: {},
            children: tree.children
          }
  } else if (element(tree)) {
    node = tree
  } else {
    throw new Error(
      // @ts-expect-error runtime.
      'Expected root or element, not `' + ((tree && tree.type) || tree) + '`'
    )
  }

  return transform(h, node, {
    schema: options.space === 'svg' ? svg : html,
    prefix:
      prefix === undefined || prefix === null
        ? r || v || vd
          ? 'h-'
          : null
        : typeof prefix === 'string'
        ? prefix
        : prefix
        ? 'h-'
        : null,
    key: 0,
    react: r,
    vue: v,
    vdom: vd,
    hyperscript: hyperscript(h)
  })
}

/**
 * Transform a hast node through a hyperscript interface to *anything*!
 *
 * @template {CreateElementLike} H
 * @param {H} h
 * @param {Element} node
 * @param {Context} ctx
 */
function transform(h, node, ctx) {
  const parentSchema = ctx.schema
  let schema = parentSchema
  let name = node.tagName
  /** @type {Record<string, unknown>} */
  const attributes = {}
  /** @type {Array.<ReturnType<H>|string>} */
  const nodes = []
  let index = -1
  /** @type {string} */
  let key

  if (parentSchema.space === 'html' && name.toLowerCase() === 'svg') {
    schema = svg
    ctx.schema = schema
  }

  for (key in node.properties) {
    if (node.properties && own.call(node.properties, key)) {
      addAttribute(attributes, key, node.properties[key], ctx, name)
    }
  }

  if (ctx.vdom) {
    if (schema.space === 'html') {
      name = name.toUpperCase()
    } else if (schema.space) {
      attributes.namespace = ns[schema.space]
    }
  }

  if (ctx.prefix) {
    ctx.key++
    attributes.key = ctx.prefix + ctx.key
  }

  if (node.children) {
    while (++index < node.children.length) {
      const value = node.children[index]

      if (element(value)) {
        nodes.push(transform(h, value, ctx))
      } else if (text(value)) {
        nodes.push(value.value)
      }
    }
  }

  // Restore parent schema.
  ctx.schema = parentSchema

  // Ensure no React warnings are triggered for void elements having children
  // passed in.
  return nodes.length > 0
    ? h.call(node, name, attributes, nodes)
    : h.call(node, name, attributes)
}

/**
 * @param {Record<string, unknown>} props
 * @param {string} prop
 * @param {unknown} value
 * @param {Context} ctx
 * @param {string} name
 */
// eslint-disable-next-line complexity, max-params
function addAttribute(props, prop, value, ctx, name) {
  const info = find(ctx.schema, prop)
  /** @type {string|undefined} */
  let subprop

  // Ignore nullish and `NaN` values.
  // Ignore `false` and falsey known booleans for hyperlike DSLs.
  if (
    value === undefined ||
    value === null ||
    (typeof value === 'number' && Number.isNaN(value)) ||
    (value === false && (ctx.vue || ctx.vdom || ctx.hyperscript)) ||
    (!value && info.boolean && (ctx.vue || ctx.vdom || ctx.hyperscript))
  ) {
    return
  }

  if (Array.isArray(value)) {
    // Accept `array`.
    // Most props are space-separated.
    value = info.commaSeparated ? commas(value) : spaces(value)
  }

  // Treat `true` and truthy known booleans.
  if (info.boolean && ctx.hyperscript) {
    value = ''
  }

  // VDOM, Vue, and React accept `style` as object.
  if (
    info.property === 'style' &&
    typeof value === 'string' &&
    (ctx.react || ctx.vue || ctx.vdom)
  ) {
    value = parseStyle(value, name)
  }

  if (ctx.vue) {
    if (info.property !== 'style') subprop = 'attrs'
  } else if (!info.mustUseProperty) {
    if (ctx.vdom) {
      if (info.property !== 'style') subprop = 'attributes'
    } else if (ctx.hyperscript) {
      subprop = 'attrs'
    }
  }

  if (subprop) {
    props[subprop] = Object.assign(props[subprop] || {}, {
      [info.attribute]: value
    })
  } else if (info.space && ctx.react) {
    props[toReact[info.property] || info.property] = value
  } else {
    props[info.attribute] = value
  }
}

/**
 * Check if `h` is `react.createElement`.
 *
 * @param {CreateElementLike} h
 * @returns {boolean}
 */
function react(h) {
  /** @type {unknown} */
  const node = h('div', {})
  return Boolean(
    node &&
      // @ts-expect-error Looks like a React node.
      ('_owner' in node || '_store' in node) &&
      // @ts-expect-error Looks like a React node.
      (node.key === undefined || node.key === null)
  )
}

/**
 * Check if `h` is `hyperscript`.
 *
 * @param {CreateElementLike} h
 * @returns {boolean}
 */
function hyperscript(h) {
  return 'context' in h && 'cleanup' in h
}

/**
 * Check if `h` is `virtual-dom/h`.
 *
 * @param {CreateElementLike} h
 * @returns {boolean}
 */
function vdom(h) {
  /** @type {unknown} */
  const node = h('div', {})
  // @ts-expect-error Looks like a vnode.
  return node.type === 'VirtualNode'
}

/**
 * Check if `h` is Vue.
 *
 * @param {CreateElementLike} h
 * @returns {boolean}
 */
function vue(h) {
  /** @type {unknown} */
  const node = h('div', {})
  // @ts-expect-error Looks like a Vue node.
  return Boolean(node && node.context && node.context._isVue)
}

/**
 * @param {string} value
 * @param {string} tagName
 * @returns {Record<string, string>}
 */
function parseStyle(value, tagName) {
  /** @type {Record<string, string>} */
  const result = {}

  try {
    style(value, (name, value) => {
      if (name.slice(0, 4) === '-ms-') name = 'ms-' + name.slice(4)

      result[
        name.replace(
          /-([a-z])/g,
          /**
           * @param {string} _
           * @param {string} $1
           * @returns {string}
           */ (_, $1) => $1.toUpperCase()
        )
      ] = value
    })
  } catch (error) {
    error.message =
      tagName + '[style]' + error.message.slice('undefined'.length)
    throw error
  }

  return result
}
