/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('hast').Element} Element
 *
 * @typedef {string} TagName
 * @typedef {null|undefined|TagName|TestFunctionAnything|Array.<TagName|TestFunctionAnything>} Test
 */
/**
 * @template {Element} T
 * @typedef {null|undefined|T['tagName']|TestFunctionPredicate<T>|Array.<T['tagName']|TestFunctionPredicate<T>>} PredicateTest
 */
/**
 * Check if an element passes a test
 *
 * @callback TestFunctionAnything
 * @param {Element} element
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {boolean|void}
 */
/**
 * Check if an element passes a certain node test
 *
 * @template {Element} X
 * @callback TestFunctionPredicate
 * @param {Element} element
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {element is X}
 */
/**
 * Check if a node is an element and passes a certain node test
 *
 * @callback AssertAnything
 * @param {unknown} [node]
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {boolean}
 */
/**
 * Check if a node is an element and passes a certain node test
 *
 * @template {Element} Y
 * @callback AssertPredicate
 * @param {unknown} [node]
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {node is Y}
 */
export const isElement: (() => false) &
  (<T extends import('hast').Element = import('hast').Element>(
    node: unknown,
    test?: PredicateTest<T>,
    index?: number | undefined,
    parent?:
      | import('unist').Parent<
          import('unist').Node<import('unist').Data>,
          import('unist').Data
        >
      | undefined,
    context?: unknown
  ) => node is T) &
  ((
    node: unknown,
    test: Test,
    index?: number | undefined,
    parent?:
      | import('unist').Parent<
          import('unist').Node<import('unist').Data>,
          import('unist').Data
        >
      | undefined,
    context?: unknown
  ) => boolean)
export const convertElement: (<T extends import('hast').Element>(
  test: T['tagName'] | TestFunctionPredicate<T>
) => AssertPredicate<T>) &
  ((test?: Test) => AssertAnything)
export type Node = import('unist').Node
export type Parent = import('unist').Parent
export type Element = import('hast').Element
export type TagName = string
export type Test =
  | null
  | undefined
  | TagName
  | TestFunctionAnything
  | Array<TagName | TestFunctionAnything>
export type PredicateTest<T extends import('hast').Element> =
  | null
  | undefined
  | T['tagName']
  | TestFunctionPredicate<T>
  | Array<T['tagName'] | TestFunctionPredicate<T>>
/**
 * Check if an element passes a test
 */
export type TestFunctionAnything = (
  element: Element,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => boolean | void
/**
 * Check if an element passes a certain node test
 */
export type TestFunctionPredicate<X extends import('hast').Element> = (
  element: Element,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => element is X
/**
 * Check if a node is an element and passes a certain node test
 */
export type AssertAnything = (
  node?: unknown,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => boolean
/**
 * Check if a node is an element and passes a certain node test
 */
export type AssertPredicate<Y extends import('hast').Element> = (
  node?: unknown,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => node is Y
