/**
 * Support GFM or markdown on github.com.
 *
 * @param {Options} [options]
 * @returns {Extension}
 */
export function gfm(
  options?:
    | import('micromark-extension-gfm-strikethrough/lib/syntax').Options
    | undefined
): Extension
/**
 * Support to compile GFM to HTML.
 *
 * @param {HtmlOptions} [options]
 * @returns {HtmlExtension}
 */
export function gfmHtml(
  options?:
    | import('micromark-extension-gfm-footnote/lib/html').Options
    | undefined
): HtmlExtension
export type Extension = import('micromark-util-types').Extension
export type HtmlExtension = import('micromark-util-types').HtmlExtension
export type Options = import('micromark-extension-gfm-strikethrough').Options
export type HtmlOptions = import('micromark-extension-gfm-footnote').HtmlOptions
