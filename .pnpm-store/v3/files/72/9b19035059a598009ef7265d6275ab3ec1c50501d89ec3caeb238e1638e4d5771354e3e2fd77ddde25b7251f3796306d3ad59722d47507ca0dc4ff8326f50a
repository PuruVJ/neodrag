export declare type ParentNode = RootNode | ElementNode | ComponentNode | CustomElementNode | FragmentNode | ExpressionNode;
export declare type LiteralNode = TextNode | DoctypeNode | CommentNode | FrontmatterNode;
export declare type Node = RootNode | ElementNode | ComponentNode | CustomElementNode | FragmentNode | ExpressionNode | TextNode | FrontmatterNode | DoctypeNode | CommentNode;
export interface Position {
    start: Point;
    end?: Point;
}
export interface Point {
    /** 1-based line number */
    line: number;
    /** 1-based column number, per-line */
    column: number;
    /** 0-based byte offset */
    offset: number;
}
export interface BaseNode {
    type: string;
    position?: Position;
}
export interface ParentLikeNode extends BaseNode {
    type: 'element' | 'component' | 'custom-element' | 'fragment' | 'expression' | 'root';
    children: Node[];
}
export interface ValueNode extends BaseNode {
    value: string;
}
export interface RootNode extends ParentLikeNode {
    type: 'root';
}
export interface AttributeNode extends BaseNode {
    type: 'attribute';
    kind: 'quoted' | 'empty' | 'expression' | 'spread' | 'shorthand' | 'template-literal';
    name: string;
    value: string;
}
export interface TextNode extends ValueNode {
    type: 'text';
}
export interface ElementNode extends ParentLikeNode {
    type: 'element';
    name: string;
    attributes: AttributeNode[];
}
export interface FragmentNode extends ParentLikeNode {
    type: 'fragment';
    name: string;
    attributes: AttributeNode[];
}
export interface ComponentNode extends ParentLikeNode {
    type: 'component';
    name: string;
    attributes: AttributeNode[];
}
export interface CustomElementNode extends ParentLikeNode {
    type: 'custom-element';
    name: string;
    attributes: AttributeNode[];
}
export declare type TagLikeNode = ElementNode | FragmentNode | ComponentNode | CustomElementNode;
export interface DoctypeNode extends ValueNode {
    type: 'doctype';
}
export interface CommentNode extends ValueNode {
    type: 'comment';
}
export interface FrontmatterNode extends ValueNode {
    type: 'frontmatter';
}
export interface ExpressionNode extends ParentLikeNode {
    type: 'expression';
}
