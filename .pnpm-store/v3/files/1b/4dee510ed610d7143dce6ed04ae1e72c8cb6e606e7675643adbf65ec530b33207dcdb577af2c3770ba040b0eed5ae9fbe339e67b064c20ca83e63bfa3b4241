/**
 * @param {Schema} schema
 * @param {string} defaultTagName
 * @param {Array<string>} [caseSensitive]
 */
export function core(
  schema: Schema,
  defaultTagName: string,
  caseSensitive?: string[] | undefined
): {
  (): Root
  (selector: null | undefined, ...children: Array<HChild>): Root
  (
    selector: string,
    properties?: HProperties,
    ...children: Array<HChild>
  ): Element
  (selector: string, ...children: Array<HChild>): Element
}
export type Root = import('hast').Root
export type Element = import('hast').Element
export type Properties = import('hast').Properties
export type Child = Root['children'][number]
export type Node = Child | Root
export type Info = import('property-information').Info
export type Schema = import('property-information').Schema
export type HResult = Root | Element
export type HStyleValue = string | number
export type HStyle = Record<string, HStyleValue>
export type HPrimitiveValue = string | number | boolean | null | undefined
export type HArrayValue = Array<string | number>
export type HPropertyValue = HPrimitiveValue | (string | number)[]
/**
 * Acceptable properties value.
 */
export type HProperties = {
  [property: string]: HStyle | HPropertyValue
}
export type HPrimitiveChild = string | number | null | undefined
export type HArrayChild = Array<Node | HPrimitiveChild>
/**
 * Acceptable child value
 */
export type HChild = Node | HPrimitiveChild | (Node | HPrimitiveChild)[]
