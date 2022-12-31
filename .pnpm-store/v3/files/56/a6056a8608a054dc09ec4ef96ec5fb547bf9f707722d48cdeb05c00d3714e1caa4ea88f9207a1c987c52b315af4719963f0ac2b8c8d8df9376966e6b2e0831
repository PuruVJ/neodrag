/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist').Literal} Literal
 * @typedef {Object.<string, unknown>} Props
 * @typedef {Array.<Node>|string} ChildrenOrValue
 *
 * @typedef {(<T extends string, P extends Record<string, unknown>, C extends Node[]>(type: T, props: P, children: C) => {type: T, children: C} & P)} BuildParentWithProps
 * @typedef {(<T extends string, P extends Record<string, unknown>>(type: T, props: P, value: string) => {type: T, value: string} & P)} BuildLiteralWithProps
 * @typedef {(<T extends string, P extends Record<string, unknown>>(type: T, props: P) => {type: T} & P)} BuildVoidWithProps
 * @typedef {(<T extends string, C extends Node[]>(type: T, children: C) => {type: T, children: C})} BuildParent
 * @typedef {(<T extends string>(type: T, value: string) => {type: T, value: string})} BuildLiteral
 * @typedef {(<T extends string>(type: T) => {type: T})} BuildVoid
 */
export var u: BuildVoid &
  BuildVoidWithProps &
  BuildLiteral &
  BuildLiteralWithProps &
  BuildParent &
  BuildParentWithProps
export type Node = import('unist').Node
export type Parent = import('unist').Parent
export type Literal = import('unist').Literal
export type Props = {
  [x: string]: unknown
}
export type ChildrenOrValue = Array<Node> | string
export type BuildParentWithProps = <
  T extends string,
  P extends Record<string, unknown>,
  C extends import('unist').Node[]
>(
  type: T,
  props: P,
  children: C
) => {
  type: T
  children: C
} & P
export type BuildLiteralWithProps = <
  T extends string,
  P extends Record<string, unknown>
>(
  type: T,
  props: P,
  value: string
) => {
  type: T
  value: string
} & P
export type BuildVoidWithProps = <
  T extends string,
  P extends Record<string, unknown>
>(
  type: T,
  props: P
) => {
  type: T
} & P
export type BuildParent = <T extends string, C extends import('unist').Node[]>(
  type: T,
  children: C
) => {
  type: T
  children: C
}
export type BuildLiteral = <T extends string>(
  type: T,
  value: string
) => {
  type: T
  value: string
}
export type BuildVoid = <T extends string>(
  type: T
) => {
  type: T
}
