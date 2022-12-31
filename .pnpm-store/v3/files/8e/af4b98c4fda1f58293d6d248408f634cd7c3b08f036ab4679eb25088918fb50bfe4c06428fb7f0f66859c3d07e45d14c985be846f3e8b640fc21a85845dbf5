/**
 * @param {Options} [options='yaml']
 * @returns {Array<Matter>}
 */
export function matters(options?: Options | undefined): Array<Matter>
/**
 * Either `'yaml'` or `'toml'`
 */
export type Preset = 'yaml' | 'toml'
export type Info = {
  open: string
  close: string
}
export type MatterProps = {
  /**
   *  Type to tokenize as
   */
  type: string
  /**
   * If `true`, matter can be found anywhere in the document.
   * If `false` (default), only matter at the start of the document is
   * recognized.
   */
  anywhere?: boolean | undefined
}
export type MarkerProps = {
  /**
   * Character used to construct fences.
   * By providing an object with `open` and `close` different characters can be
   * used for opening and closing fences.
   * For example the character `'-'` will result in `'---'` being used as the
   * fence
   */
  marker: string | Info
  fence?: undefined
}
export type FenceProps = {
  /**
   * String used as the complete fence.
   * By providing an object with `open` and `close` different values can be used
   * for opening and closing fences.
   * This can be used too if fences contain different characters or lengths
   * other than 3.
   */
  fence: string | Info
  marker?: undefined
}
export type Matter = (MatterProps & FenceProps) | (MatterProps & MarkerProps)
export type Options = Preset | Matter | Array<Preset | Matter>
