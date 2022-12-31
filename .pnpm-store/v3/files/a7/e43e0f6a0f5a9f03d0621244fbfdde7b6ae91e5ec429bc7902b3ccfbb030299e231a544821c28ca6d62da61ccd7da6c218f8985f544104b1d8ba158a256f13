import type { Node } from 'vscode-html-languageservice';
import { CompletionItemKind, Position, Range, SemanticTokensLegend, SymbolKind } from 'vscode-languageserver';
import { AstroDocument, TagInformation } from '../../core/documents';
import type { AstroSnapshot, ScriptTagDocumentSnapshot, SnapshotFragment } from './snapshots/DocumentSnapshot';
export declare const enum TokenType {
    class = 0,
    enum = 1,
    interface = 2,
    namespace = 3,
    typeParameter = 4,
    type = 5,
    parameter = 6,
    variable = 7,
    enumMember = 8,
    property = 9,
    function = 10,
    method = 11
}
export declare const enum TokenModifier {
    declaration = 0,
    static = 1,
    async = 2,
    readonly = 3,
    defaultLibrary = 4,
    local = 5
}
export declare function getSemanticTokenLegend(): SemanticTokensLegend;
export declare function symbolKindFromString(kind: string): SymbolKind;
export declare function scriptElementKindToCompletionItemKind(kind: ts.ScriptElementKind, ts: typeof import('typescript/lib/tsserverlibrary')): CompletionItemKind;
export declare function getCommitCharactersForScriptElement(kind: ts.ScriptElementKind, ts: typeof import('typescript/lib/tsserverlibrary')): string[] | undefined;
export declare function getExtensionFromScriptKind(kind: ts.ScriptKind | undefined, ts: typeof import('typescript/lib/tsserverlibrary')): ts.Extension;
export declare function findTsConfigPath(fileName: string, rootUris: string[], ts: typeof import('typescript/lib/tsserverlibrary')): string;
export declare function isSubPath(uri: string, possibleSubPath: string): boolean;
export declare function getScriptKindFromFileName(fileName: string, ts: typeof import('typescript/lib/tsserverlibrary')): ts.ScriptKind;
export declare function convertRange(document: {
    positionAt: (offset: number) => Position;
}, range: {
    start?: number;
    length?: number;
}): Range;
export declare function convertToLocationRange(defDoc: SnapshotFragment, textSpan: ts.TextSpan): Range;
export declare function ensureFrontmatterInsert(resultRange: Range, document: AstroDocument): Range;
export declare function checkEndOfFileCodeInsert(resultRange: Range, document: AstroDocument): Range;
export declare function removeAstroComponentSuffix(name: string): string;
export declare type FrameworkExt = 'astro' | 'vue' | 'jsx' | 'tsx' | 'svelte';
declare type FrameworkVirtualExt = 'ts' | 'tsx';
export declare function getFrameworkFromFilePath(filePath: string): FrameworkExt;
export declare function isVirtualFrameworkFilePath(ext: FrameworkExt, virtualExt: FrameworkVirtualExt, filePath: string): boolean;
export declare function isAstroFilePath(filePath: string): boolean;
export declare function isFrameworkFilePath(filePath: string): boolean;
export declare function isVirtualAstroFilePath(filePath: string): boolean;
export declare function isVirtualVueFilePath(filePath: string): boolean;
export declare function isVirtualSvelteFilePath(filePath: string): boolean;
export declare function isVirtualFilePath(filePath: string): boolean;
export declare function toVirtualAstroFilePath(filePath: string): string;
export declare function toVirtualFilePath(filePath: string): string;
export declare function toRealAstroFilePath(filePath: string): string;
export declare function ensureRealAstroFilePath(filePath: string): string;
export declare function ensureRealFilePath(filePath: string): string;
export declare function isDocumentSymbolsPath(filePath: string): boolean;
/**
 * Return if a script tag is TypeScript or JavaScript
 */
export declare function getScriptTagLanguage(scriptTag: TagInformation): 'js' | 'ts';
export declare function getScriptTagSnapshot(snapshot: AstroSnapshot, document: AstroDocument, tagInfo: Node | {
    start: number;
    end: number;
}, position?: Position): {
    snapshot: ScriptTagDocumentSnapshot;
    filePath: string;
    index: number;
    offset: number;
};
export {};
