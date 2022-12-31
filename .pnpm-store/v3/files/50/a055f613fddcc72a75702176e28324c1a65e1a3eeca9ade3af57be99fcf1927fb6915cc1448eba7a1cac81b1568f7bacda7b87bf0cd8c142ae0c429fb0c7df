/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {Root|Content} Node
 * @typedef {Extract<Node, import('unist').Parent>} Parent
 *
 * @typedef {import('remark-mdx')} DoNotTouchAsThisImportItIncludesMdxInTree
 */
/**
 * A tiny plugin that unravels `<p><h1>x</h1></p>` but also
 * `<p><Component /></p>` (so it has no knowledge of “HTML”).
 * It also marks JSX as being explicitly JSX, so when a user passes a `h1`
 * component, it is used for `# heading` but not for `<h1>heading</h1>`.
 *
 * @type {import('unified').Plugin<Array<void>, Root>}
 */
export default function remarkMarkAndUnravel(): (tree: any) => void;
