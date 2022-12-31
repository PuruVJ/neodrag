/* eslint-disable @typescript-eslint/ban-types */

import type {Node, Parent} from 'unist'
import type {Test} from 'unist-util-is'

/**
 * Union of the action types
 */
export type Action = boolean | 'skip'

/**
 * Move to the sibling at index next (after node itself is completely
 * traversed).
 * Useful if mutating the tree, such as removing the node the visitor is
 * currently on, or any of its previous siblings (or next siblings, in case of
 * reverse) Results less than 0 or greater than or equal to `children.length`
 * stop traversing the parent.
 */
export type Index = number

/**
 * List with one or two values, the first an action, the second an index.
 */
export type ActionTuple = [
  (Action | null | undefined | void)?,
  (Index | null | undefined)?
]

/**
 * Any value that can be returned from a visitor
 */
export type VisitorResult =
  | null
  | undefined
  | Action
  | Index
  | ActionTuple
  | void

/**
 * Internal utility to collect all descendants of in `Tree`.
 */
export type InclusiveDescendant<
  Tree extends Node = never,
  Found = void
> = Tree extends Parent
  ?
      | Tree
      | InclusiveDescendant<
          Exclude<Tree['children'][number], Found | Tree>,
          Found | Tree
        >
  : Tree

type Predicate<Fn, Fallback = never> = Fn extends (
  value: any
) => value is infer Thing
  ? Thing
  : Fallback

type MatchesOne<Value, Check> =
  // Is this a node?
  Value extends Node
    ? // No test.
      Check extends null
      ? Value
      : // No test.
      Check extends undefined
      ? Value
      : // Function test.
      Check extends Function
      ? Extract<Value, Predicate<Check, Value>>
      : // String (type) test.
      Value['type'] extends Check
      ? Value
      : // Partial test.
      Value extends Check
      ? Value
      : never
    : never

export type Matches<Value, Check> =
  // Is this a list?
  Check extends Array<any>
    ? MatchesOne<Value, Check[keyof Check]>
    : MatchesOne<Value, Check>

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
> = (node: Visited, ancestors: Array<Ancestor>) => VisitorResult

export type BuildVisitor<
  Tree extends Node = Node,
  Check extends Test = string
> = Visitor<
  Matches<InclusiveDescendant<Tree>, Check>,
  Extract<InclusiveDescendant<Tree>, Parent>
>

/* eslint-enable @typescript-eslint/ban-types */
