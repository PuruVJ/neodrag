/**
 * @param tree mdast tree
 * @param find Value to find and remove. When `string`, escaped and made into a global `RegExp`
 * @param [replace] Value to insert.
 *   * When `string`, turned into a Text node.
 *   * When `Function`, called with the results of calling `RegExp.exec` as
 *     arguments, in which case it can return a single or a list of `Node`,
 *     a `string` (which is wrapped in a `Text` node), or `false` to not replace
 * @param [options] Configuration.
 */
export const findAndReplace: ((
  tree: Node,
  find: Find,
  replace?: Replace,
  options?: Options
) => Node) &
  ((
    tree: Node,
    schema: FindAndReplaceSchema | FindAndReplaceList,
    options?: Options
  ) => Node)
/**
 * Configuration (optional).
 */
export type Options = {
  /**
   * `unist-util-is` test used to assert parents
   */
  ignore?: Test
}
export type Root = import('mdast').Root
export type Content = import('mdast').Content
export type PhrasingContent = import('mdast').PhrasingContent
export type Text = import('mdast').Text
export type Node = Content | Root
export type Parent = Exclude<Extract<Node, import('mdast').Parent>, Root>
export type Test = import('unist-util-visit-parents').Test
export type VisitorResult = import('unist-util-visit-parents').VisitorResult
export type RegExpMatchObject = {
  index: number
  input: string
  stack: [Root, ...Array<Parent>, Text]
}
export type Find = string | RegExp
export type Replace = string | ReplaceFunction
export type FindAndReplaceTuple = [Find, Replace]
export type FindAndReplaceSchema = Record<string, Replace>
export type FindAndReplaceList = Array<[Find, Replace]>
export type Pair = [RegExp, ReplaceFunction]
export type Pairs = Array<[RegExp, ReplaceFunction]>
export type ReplaceFunction = (
  ...parameters: any[]
) =>
  | Array<PhrasingContent>
  | PhrasingContent
  | string
  | false
  | undefined
  | null
