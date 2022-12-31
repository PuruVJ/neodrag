/**
 * Visit children of tree which pass test.
 *
 * @param tree
 *   Tree to walk
 * @param [test]
 *   `unist-util-is`-compatible test
 * @param visitor
 *   Function called for nodes that pass `test`.
 * @param reverse
 *   Traverse in reverse preorder (NRL) instead of preorder (NLR) (default).
 */
export const visit: (<
  Tree extends import('unist').Node<import('unist').Data>,
  Check extends import('unist-util-is').Test
>(
  tree: Tree,
  test: Check,
  visitor: import('./complex-types.js').BuildVisitor<Tree, Check>,
  reverse?: boolean
) => void) &
  (<Tree_1 extends import('unist').Node<import('unist').Data>>(
    tree: Tree_1,
    visitor: import('./complex-types.js').BuildVisitor<Tree_1, string>,
    reverse?: boolean
  ) => void)
export type Node = import('unist').Node
export type Parent = import('unist').Parent
export type Test = import('unist-util-is').Test
export type VisitorResult = import('unist-util-visit-parents').VisitorResult
export type Visitor = import('./complex-types.js').Visitor
export {CONTINUE, EXIT, SKIP} from 'unist-util-visit-parents'
