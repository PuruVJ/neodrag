/**
 * @template {CreateElementLike} H
 * @param {H} h
 * @param {Element|Root} tree
 * @param {string|boolean|Options} [options]
 * @returns {ReturnType<H>}
 */
export function toH<H extends CreateElementLike>(
  h: H,
  tree: Element | Root,
  options?: string | boolean | Options | undefined
): ReturnType<H>
export type Element = import('hast').Element
export type Root = import('hast').Root
export type Text = import('hast').Text
export type AssertElement = import('unist-util-is').AssertPredicate<Element>
export type AssertText = import('unist-util-is').AssertPredicate<Text>
export type AssertRoot = import('unist-util-is').AssertPredicate<Root>
export type CreateElementLike = (
  name: string,
  attributes: any,
  children?: any[] | undefined
) => any
export type Context = {
  schema:
    | import('property-information/lib/util/schema').Schema
    | import('property-information/lib/util/schema').Schema
  prefix: string | null
  key: number
  react: boolean
  vue: boolean
  vdom: boolean
  hyperscript: boolean
}
export type Options = {
  prefix?: string | null | undefined
  space?: 'html' | 'svg' | undefined
}
