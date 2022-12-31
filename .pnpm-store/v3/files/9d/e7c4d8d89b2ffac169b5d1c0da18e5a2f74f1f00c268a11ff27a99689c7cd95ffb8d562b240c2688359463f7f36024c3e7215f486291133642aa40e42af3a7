/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 *
 * @typedef {string} Type
 * @typedef {Object<string, unknown>} Props
 *
 * @typedef {null|undefined|Type|Props|TestFunctionAnything|Array.<Type|Props|TestFunctionAnything>} Test
 */
/**
 * Check if a node passes a test
 *
 * @callback TestFunctionAnything
 * @param {Node} node
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {boolean|void}
 */
/**
 * Check if a node passes a certain node test
 *
 * @template {Node} X
 * @callback TestFunctionPredicate
 * @param {Node} node
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {node is X}
 */
/**
 * @callback AssertAnything
 * @param {unknown} [node]
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {boolean}
 */
/**
 * Check if a node passes a certain node test
 *
 * @template {Node} Y
 * @callback AssertPredicate
 * @param {unknown} [node]
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {node is Y}
 */
export const is: (<T extends import('unist').Node<import('unist').Data>>(
  node: unknown,
  test:
    | T['type']
    | Partial<T>
    | TestFunctionPredicate<T>
    | (T['type'] | Partial<T> | TestFunctionPredicate<T>)[],
  index?: number | null | undefined,
  parent?: Parent | null | undefined,
  context?: unknown
) => node is T) &
  ((
    node?: unknown,
    test?: Test,
    index?: number | null | undefined,
    parent?: Parent | null | undefined,
    context?: unknown
  ) => boolean)
export const convert: (<T extends import('unist').Node<import('unist').Data>>(
  test: T['type'] | Partial<T> | TestFunctionPredicate<T>
) => AssertPredicate<T>) &
  ((test?: Test) => AssertAnything)
export type Node = import('unist').Node
export type Parent = import('unist').Parent
export type Type = string
export type Props = {
  [x: string]: unknown
}
export type Test =
  | null
  | undefined
  | Type
  | Props
  | TestFunctionAnything
  | Array<Type | Props | TestFunctionAnything>
/**
 * Check if a node passes a test
 */
export type TestFunctionAnything = (
  node: Node,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => boolean | void
/**
 * Check if a node passes a certain node test
 */
export type TestFunctionPredicate<
  X extends import('unist').Node<import('unist').Data>
> = (
  node: Node,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => node is X
export type AssertAnything = (
  node?: unknown,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => boolean
/**
 * Check if a node passes a certain node test
 */
export type AssertPredicate<
  Y extends import('unist').Node<import('unist').Data>
> = (
  node?: unknown,
  index?: number | null | undefined,
  parent?: Parent | null | undefined
) => node is Y
