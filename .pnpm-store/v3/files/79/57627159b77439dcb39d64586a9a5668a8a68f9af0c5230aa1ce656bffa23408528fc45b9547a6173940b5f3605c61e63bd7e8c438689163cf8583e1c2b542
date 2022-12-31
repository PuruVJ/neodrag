/**
 * @param {Options} [options={}]
 * @returns {HtmlExtension}
 */
export function gfmFootnoteHtml(options?: Options | undefined): HtmlExtension
export type HtmlExtension = import('micromark-util-types').HtmlExtension
export type CompileContext = import('micromark-util-types').CompileContext
export type Options = {
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
  label?: string | undefined
  /**
   * Label to use from backreferences back to their footnote call.
   * Affects screen reader users.
   * Change it if you’re authoring in a different language.
   */
  backLabel?: string | undefined
}
