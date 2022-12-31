/**
 * Create a hast element from a simple CSS selector.
 *
 * @param selector A simple CSS selector.
 *   Can contain a tag-name (`foo`), classes (`.bar`), and an ID (`#baz`).
 *   Multiple classes are allowed.
 *   Uses the last ID if multiple IDs are found.
 * @param [defaultTagName='div'] Tag name to use if `selector` does not specify one.
 */
export const parseSelector: <
  Selector extends string,
  DefaultTagName extends string = 'div'
>(
  selector?: Selector,
  defaultTagName?: DefaultTagName
) => import('hast').Element & {
  tagName: import('./extract.js').ExtractTagName<Selector, DefaultTagName>
}
export type Properties = import('hast').Properties
export type Element = import('hast').Element
