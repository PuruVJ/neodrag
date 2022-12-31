export function recmaJsxRewrite(this: import("unified").Processor<void, import("estree").Program, void, void>, ...settings: [] | [RecmaJsxRewriteOptions]): void | import("unified").Transformer<import("estree").Program, import("estree").Program>;
export type Node = import('estree-jsx').Node;
export type Expression = import('estree-jsx').Expression;
export type ESFunction = import('estree-jsx').Function;
export type ImportSpecifier = import('estree-jsx').ImportSpecifier;
export type JSXElement = import('estree-jsx').JSXElement;
export type JSXIdentifier = import('estree-jsx').JSXIdentifier;
export type JSXNamespacedName = import('estree-jsx').JSXNamespacedName;
export type ModuleDeclaration = import('estree-jsx').ModuleDeclaration;
export type Program = import('estree-jsx').Program;
export type Property = import('estree-jsx').Property;
export type Statement = import('estree-jsx').Statement;
export type VariableDeclarator = import('estree-jsx').VariableDeclarator;
export type ObjectPattern = import('estree-jsx').ObjectPattern;
export type Identifier = import('estree-jsx').Identifier;
export type WalkHandler = import('estree-walker').SyncHandler;
export type Scope = import('periscopic').Scope & {
    node: Node;
};
export type RecmaJsxRewriteOptions = {
    /**
     * Whether to use an import statement or `arguments[0]` to get the provider.
     */
    outputFormat?: "program" | "function-body" | undefined;
    /**
     * Place to import a provider from.
     */
    providerImportSource?: string | undefined;
    /**
     * Whether to add extra info to error messages in generated code.
     * This also results in the development automatic JSX runtime
     * (`/jsx-dev-runtime`, `jsxDEV`) being used, which passes positional info to
     * nodes.
     * The default can be set to `true` in Node.js through environment variables:
     * set `NODE_ENV=development`.
     */
    development?: boolean | undefined;
};
export type StackEntry = {
    objects: Array<string>;
    components: Array<string>;
    tags: Array<string>;
    references: Record<string, {
        node: JSXElement;
        component: boolean;
    }>;
    idToInvalidComponentName: Map<string | number, string>;
    node: ESFunction;
};
