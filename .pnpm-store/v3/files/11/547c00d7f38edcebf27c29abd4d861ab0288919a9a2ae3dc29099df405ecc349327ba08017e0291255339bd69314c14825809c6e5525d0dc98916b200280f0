import { Node, ParentNode, RootNode, LiteralNode, ElementNode, CustomElementNode, ComponentNode, FragmentNode, TagLikeNode, ExpressionNode, TextNode, CommentNode, DoctypeNode, FrontmatterNode } from '../shared/ast';
export interface Visitor {
    (node: Node, parent?: ParentNode, index?: number): void | Promise<void>;
}
export declare const is: {
    parent(node: Node): node is ParentNode;
    literal(node: Node): node is LiteralNode;
    tag(node: Node): node is TagLikeNode;
    whitespace(node: Node): node is TextNode;
    root: (node: Node) => node is RootNode;
    element: (node: Node) => node is ElementNode;
    customElement: (node: Node) => node is CustomElementNode;
    component: (node: Node) => node is ComponentNode;
    fragment: (node: Node) => node is FragmentNode;
    expression: (node: Node) => node is ExpressionNode;
    text: (node: Node) => node is TextNode;
    doctype: (node: Node) => node is DoctypeNode;
    comment: (node: Node) => node is CommentNode;
    frontmatter: (node: Node) => node is FrontmatterNode;
};
export declare function walk(node: ParentNode, callback: Visitor): void;
export interface SerializeOtions {
    selfClose: boolean;
}
export declare function serialize(root: Node, opts?: SerializeOtions): string;
