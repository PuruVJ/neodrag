import parser from '@babel/parser';
import * as t from '@babel/types';
export declare const visit: {
    <S>(parent: t.Node | t.Node[] | null | undefined, opts: import("@babel/traverse").TraverseOptions<S>, scope: import("@babel/traverse").Scope | undefined, state: S, parentPath?: import("@babel/traverse").NodePath<t.Node> | undefined): void;
    (parent: t.Node | t.Node[] | null | undefined, opts?: import("@babel/traverse").TraverseOptions<t.Node> | undefined, scope?: import("@babel/traverse").Scope | undefined, state?: any, parentPath?: import("@babel/traverse").NodePath<t.Node> | undefined): void;
    visitors: typeof import("@babel/traverse").visitors;
    verify: typeof import("@babel/traverse").visitors.verify;
    explode: typeof import("@babel/traverse").visitors.explode;
};
export { t };
export declare function generate(ast: t.File): Promise<string>;
export declare const parse: (code: string) => t.File & {
    errors: parser.ParseError[];
};
