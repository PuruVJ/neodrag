/**
 * Transform a tree from hast to Parse5’s AST.
 *
 * @param {Node} tree
 * @param {Space} [space='html']
 * @returns {P5Node}
 */
export function toParse5(tree: Node, space?: Space): P5Node
export type P5Node = import('parse5').Node
export type P5Document = import('parse5').Document
export type P5Fragment = import('parse5').DocumentFragment
export type P5Doctype = import('parse5').DocumentType
export type P5Comment = import('parse5').CommentNode
export type P5Text = import('parse5').TextNode
export type P5Element = import('parse5').Element
export type P5Attribute = import('parse5').Attribute
export type P5Parent = import('parse5').ParentNode
export type P5Child = Exclude<P5Node, P5Document | P5Fragment>
export type Schema = import('property-information').Schema
export type Info = import('property-information').Info
export type Space = 'html' | 'svg'
export type Parent = import('hast').Parent
export type Root = import('hast').Root
export type Doctype = import('hast').DocType
export type Element = import('hast').Element
export type Text = import('hast').Text
export type Comment = import('hast').Comment
export type Child = Parent['children'][number]
export type Node = Child | Root
export type Handle = (node: Node, schema: Schema) => P5Node
