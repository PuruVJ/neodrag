import { FileRangeCapabilities } from '@volar/language-core';
import * as CompilerDOM from '@vue/compiler-dom';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { ResolvedVueCompilerOptions } from '../types';
export declare function generate(ts: typeof import('typescript/lib/tsserverlibrary'), compilerOptions: ts.CompilerOptions, vueCompilerOptions: ResolvedVueCompilerOptions, sourceTemplate: string, sourceLang: string, templateAst: CompilerDOM.RootNode, hasScriptSetup: boolean, cssScopedClasses?: string[]): {
    codeGen: import("@volar/source-map").SegmentWithData<FileRangeCapabilities>[];
    formatCodeGen: import("@volar/source-map").SegmentWithData<FileRangeCapabilities>[];
    cssCodeGen: import("@volar/source-map").SegmentWithData<FileRangeCapabilities>[];
    tagNames: Record<string, number[]>;
    identifiers: Set<string>;
    hasSlot: boolean;
};
export declare function walkElementNodes(node: CompilerDOM.RootNode | CompilerDOM.TemplateChildNode, cb: (node: CompilerDOM.ElementNode) => void): void;
export declare function getPatchForSlotNode(node: CompilerDOM.ElementNode): CompilerDOM.ForNode | undefined;
