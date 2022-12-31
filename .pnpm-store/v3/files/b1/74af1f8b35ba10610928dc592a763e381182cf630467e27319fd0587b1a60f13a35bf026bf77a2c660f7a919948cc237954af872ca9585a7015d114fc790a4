/**
 * Plugin to automatically add links to headings (h1-h6).
 *
 * @type {import('unified').Plugin<[Options?]|void[], Root>}
 */
export default function rehypeAutolinkHeadings(
  options?: void | Options | undefined
):
  | void
  | import('unified').Transformer<import('hast').Root, import('hast').Root>
export type Root = import('hast').Root
export type Parent = import('hast').Parent
export type Element = import('hast').Element
export type ElementChild = Element['children'][number]
export type Properties = import('hast').Properties
export type Test = import('hast-util-is-element').Test
export type Behavior = 'prepend' | 'append' | 'wrap' | 'before' | 'after'
export type Build = (node: Element) => ElementChild | ElementChild[]
/**
 * Configuration.
 */
export type Options = {
  /**
   * How to create links.
   */
  behavior?: Behavior | undefined
  /**
   * Please use `behavior` instead
   */
  behaviour?: Behavior | undefined
  /**
   * Extra properties to set on the link when injecting.
   * Defaults to `{ariaHidden: true, tabIndex: -1}` when `'prepend'` or
   * `'append'`.
   */
  properties?: import('hast').Properties | undefined
  /**
   * hast nodes to insert in the link.
   */
  content?:
    | import('hast').ElementContent
    | import('hast').ElementContent[]
    | Build
    | undefined
  /**
   * hast node to wrap the heading and link with, if `behavior` is `'before'` or
   * `'after'`.
   * There is no default.
   */
  group?:
    | import('hast').ElementContent
    | import('hast').ElementContent[]
    | Build
    | undefined
  /**
   * Test to define which heading elements are linked.
   * Any test that can be given to `hast-util-is-element` is supported.
   * The default (no test) is to link all headings.
   * Can be used to link only h1-h3, or for example all except h1.
   */
  test?: Test
}
