import { RootNode } from './ast';
import { DiagnosticCode } from './diagnostics';
export * from './ast';
export * from './diagnostics';
export interface PreprocessorResult {
    code: string;
    map?: string;
}
export interface PreprocessorError {
    error: string;
}
export interface ParseOptions {
    position?: boolean;
}
export declare enum DiagnosticSeverity {
    Error = 1,
    Warning = 2,
    Information = 3,
    Hint = 4
}
export interface DiagnosticMessage {
    severity: DiagnosticSeverity;
    code: DiagnosticCode;
    location: DiagnosticLocation;
    hint?: string;
    text: string;
}
export interface DiagnosticLocation {
    file: string;
    line: number;
    column: number;
    length: number;
}
export interface TransformOptions {
    internalURL?: string;
    site?: string;
    sourcefile?: string;
    pathname?: string;
    moduleId?: string;
    sourcemap?: boolean | 'inline' | 'external' | 'both';
    compact?: boolean;
    /**
     * @deprecated "as" has been removed and no longer has any effect!
     */
    as?: 'document' | 'fragment';
    projectRoot?: string;
    resolvePath?: (specifier: string) => Promise<string>;
    preprocessStyle?: (content: string, attrs: Record<string, string>) => null | Promise<PreprocessorResult | PreprocessorError>;
    experimentalStaticExtraction?: boolean;
}
export declare type HoistedScript = {
    type: string;
} & ({
    type: 'external';
    src: string;
} | {
    type: 'inline';
    code: string;
    map: string;
});
export interface HydratedComponent {
    exportName: string;
    specifier: string;
    resolvedPath: string;
}
export interface TransformResult {
    code: string;
    map: string;
    scope: string;
    styleError: string[];
    diagnostics: DiagnosticMessage[];
    css: string[];
    scripts: HoistedScript[];
    hydratedComponents: HydratedComponent[];
    clientOnlyComponents: HydratedComponent[];
}
export interface SourceMap {
    file: string;
    mappings: string;
    names: string[];
    sources: string[];
    sourcesContent: string[];
    version: number;
}
export interface TSXResult {
    code: string;
    map: SourceMap;
    diagnostics: DiagnosticMessage[];
}
export interface ParseResult {
    ast: RootNode;
    diagnostics: DiagnosticMessage[];
}
export declare function transform(input: string, options?: TransformOptions): Promise<TransformResult>;
export declare function parse(input: string, options?: ParseOptions): Promise<ParseResult>;
export declare function convertToTSX(input: string, options?: {
    sourcefile?: string;
}): Promise<TSXResult>;
export declare function initialize(options: InitializeOptions): Promise<void>;
export interface InitializeOptions {
    wasmURL?: string;
}
