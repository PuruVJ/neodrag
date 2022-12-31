export function recmaDocument(this: import("unified").Processor<void, import("estree").Program, void, void>, ...settings: [RecmaDocumentOptions] | []): void | import("unified").Transformer<import("estree").Program, import("estree").Program>;
export type Directive = import('estree-jsx').Directive;
export type ExportDefaultDeclaration = import('estree-jsx').ExportDefaultDeclaration;
export type ExportSpecifier = import('estree-jsx').ExportSpecifier;
export type ExportNamedDeclaration = import('estree-jsx').ExportNamedDeclaration;
export type ExportAllDeclaration = import('estree-jsx').ExportAllDeclaration;
export type Expression = import('estree-jsx').Expression;
export type FunctionDeclaration = import('estree-jsx').FunctionDeclaration;
export type ImportDeclaration = import('estree-jsx').ImportDeclaration;
export type JSXElement = import('estree-jsx').JSXElement;
export type ModuleDeclaration = import('estree-jsx').ModuleDeclaration;
export type Node = import('estree-jsx').Node;
export type Program = import('estree-jsx').Program;
export type SimpleLiteral = import('estree-jsx').SimpleLiteral;
export type Statement = import('estree-jsx').Statement;
export type VariableDeclarator = import('estree-jsx').VariableDeclarator;
export type SpreadElement = import('estree-jsx').SpreadElement;
export type Property = import('estree-jsx').Property;
export type RecmaDocumentOptions = {
    /**
     * Whether to use either `import` and `export` statements to get the runtime
     * (and optionally provider) and export the content, or get values from
     * `arguments` and return things.
     */
    outputFormat?: "program" | "function-body" | undefined;
    /**
     * Whether to keep `import` (and `export … from`) statements or compile them
     * to dynamic `import()` instead.
     */
    useDynamicImport?: boolean | undefined;
    /**
     * Resolve `import`s (and `export … from`, and `import.meta.url`) relative to
     * this URL.
     */
    baseUrl?: string | undefined;
    /**
     * Pragma for JSX (used in classic runtime).
     */
    pragma?: string | undefined;
    /**
     * Pragma for JSX fragments (used in classic runtime).
     */
    pragmaFrag?: string | undefined;
    /**
     * Where to import the identifier of `pragma` from (used in classic runtime).
     */
    pragmaImportSource?: string | undefined;
    /**
     * Place to import automatic JSX runtimes from (used in automatic runtime).
     */
    jsxImportSource?: string | undefined;
    /**
     * JSX runtime to use.
     */
    jsxRuntime?: "automatic" | "classic" | undefined;
};
