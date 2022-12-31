import type {Node, Parent} from 'unist'
import type {Test} from 'unist-util-is'
import type {
  VisitorResult,
  Matches,
  InclusiveDescendant
} from 'unist-util-visit-parents/complex-types.js'

/**
 * Called when a node (matching test, if given) is found.
 * Visitors are free to transform node.
 * They can also transform the parent of node (the last of ancestors).
 * Replacing node itself, if `SKIP` is not returned, still causes its descendants to be visited.
 * If adding or removing previous siblings (or next siblings, in case of reverse) of node,
 * visitor should return a new index (number) to specify the sibling to traverse after node is traversed.
 * Adding or removing next siblings of node (or previous siblings, in case of reverse)
 * is handled as expected without needing to return a new index.
 * Removing the children property of an ancestor still results in them being traversed.
 */
export type Visitor<
  Visited extends Node = Node,
  Ancestor extends Parent = Parent
> = (
  node: Visited,
  index: Visited extends Node ? number | null : never,
  parent: Ancestor extends Node ? Ancestor | null : Ancestor
) => VisitorResult

type ParentsOf<
  Ancestor extends Node,
  Child extends Node
> = Ancestor extends Parent
  ? Child extends Ancestor['children'][number]
    ? Ancestor
    : never
  : never

type BuildVisitorFromMatch<
  Visited extends Node,
  Ancestor extends Parent
> = Visitor<Visited, ParentsOf<Ancestor, Visited>>

type BuildVisitorFromDescendants<
  Descendant extends Node,
  Check extends Test
> = BuildVisitorFromMatch<
  Matches<Descendant, Check>,
  Extract<Descendant, Parent>
>

export type BuildVisitor<
  Tree extends Node = Node,
  Check extends Test = string
> = BuildVisitorFromDescendants<InclusiveDescendant<Tree>, Check>
