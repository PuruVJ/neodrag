/**
 * Transform `tree` (an mdast node) to a hast node.
 *
 * @param {MdastNode} tree mdast node
 * @param {Options} [options] Configuration
 * @returns {HastNode|null|undefined} hast node
 */
export function toHast(
  tree: MdastNode,
  options?: Options | undefined
): HastNode | null | undefined
export {handlers as defaultHandlers} from './handlers/index.js'
export type MdastNode =
  | import('mdast').Root
  | import('mdast').Parent['children'][number]
export type HastNode =
  | import('hast').Root
  | import('hast').Parent['children'][number]
export type Parent = import('mdast').Parent
export type Definition = import('mdast').Definition
export type FootnoteDefinition = import('mdast').FootnoteDefinition
export type Properties = import('hast').Properties
export type Element = import('hast').Element
export type Content = import('hast').ElementContent
export type PositionLike = import('unist-util-position').PositionLike
export type EmbeddedHastFields = {
  /**
   * Defines the tag name of an element.
   */
  hName?: string | undefined
  /**
   * Defines the properties of an element.
   */
  hProperties?: import('hast').Properties | undefined
  /**
   * Defines the (hast) children of an element.
   */
  hChildren?: import('hast').ElementContent[] | undefined
}
/**
 * unist data with embedded hast fields.
 */
export type Data = Record<string, unknown> & EmbeddedHastFields
/**
 * unist node with embedded hast data.
 */
export type NodeWithData = MdastNode & {
  data?: Data
}
/**
 * Handle a node.
 */
export type Handler = (
  h: H,
  node: any,
  parent: Parent | null
) => Content | Array<Content> | null | undefined
export type HFunctionProps = (
  node: MdastNode | PositionLike | null | undefined,
  tagName: string,
  props: Properties,
  children?: import('hast').ElementContent[] | null | undefined
) => Element
export type HFunctionNoProps = (
  node: MdastNode | PositionLike | null | undefined,
  tagName: string,
  children?: import('hast').ElementContent[] | null | undefined
) => Element
export type HFields = {
  /**
   * Whether HTML is allowed.
   */
  dangerous: boolean
  /**
   * Prefix to use to prevent DOM clobbering.
   */
  clobberPrefix: string
  /**
   * Label to use to introduce the footnote section.
   */
  footnoteLabel: string
  /**
   * HTML used for the footnote label.
   */
  footnoteLabelTagName: string
  /**
   * Properties on the HTML tag used for the footnote label.
   */
  footnoteLabelProperties: Properties
  /**
   * Label to use to go back to a footnote call from the footnote section.
   */
  footnoteBackLabel: string
  /**
   * Definition cache.
   */
  definition: (identifier: string) => Definition | null
  /**
   * Footnote cache.
   */
  footnoteById: Record<string, FootnoteDefinition>
  /**
   * Order in which footnotes occur.
   */
  footnoteOrder: Array<string>
  /**
   * Counts the same footnote was used.
   */
  footnoteCounts: Record<string, number>
  /**
   * Applied handlers.
   */
  handlers: Handlers
  /**
   * Handler for any none not in `passThrough` or otherwise handled.
   */
  unknownHandler: Handler
  /**
   * Like `h` but lower-level and usable on non-elements.
   */
  augment: (
    left: NodeWithData | PositionLike | null | undefined,
    right: Content
  ) => Content
  /**
   * List of node types to pass through untouched (except for their children).
   */
  passThrough: Array<string>
}
/**
 * Configuration (optional).
 */
export type Options = {
  /**
   * Whether to allow `html` nodes and inject them as `raw` HTML.
   */
  allowDangerousHtml?: boolean | undefined
  /**
   * Prefix to use before the `id` attribute to prevent it from *clobbering*.
   * attributes.
   * DOM clobbering is this:
   *
   * ```html
   * <p id=x></p>
   * <script>alert(x)</script>
   * ```
   *
   * Elements by their ID are made available in browsers on the `window` object.
   * Using a prefix prevents this from being a problem.
   */
  clobberPrefix?: string | undefined
  /**
   * Label to use for the footnotes section.
   * Affects screen reader users.
   * Change it if you’re authoring in a different language.
   */
  footnoteLabel?: string | undefined
  /**
   * HTML tag to use for the footnote label.
   * Can be changed to match your document structure and play well with your choice of css.
   */
  footnoteLabelTagName?: string | undefined
  /**
   * Properties to use on the footnote label.
   * A 'sr-only' class is added by default to hide this from sighted users.
   * Change it to make the label visible, or add classes for other purposes.
   */
  footnoteLabelProperties?: import('hast').Properties | undefined
  /**
   * Label to use from backreferences back to their footnote call.
   * Affects screen reader users.
   * Change it if you’re authoring in a different language.
   */
  footnoteBackLabel?: string | undefined
  /**
   * Object mapping mdast nodes to functions handling them
   */
  handlers?: Handlers | undefined
  /**
   * List of custom mdast node types to pass through (keep) in hast
   */
  passThrough?: string[] | undefined
  /**
   * Handler for all unknown nodes.
   */
  unknownHandler?: Handler | undefined
}
/**
 * Map of node types to handlers
 */
export type Handlers = Record<string, Handler>
/**
 * Handle context
 */
export type H = HFunctionProps & HFunctionNoProps & HFields
