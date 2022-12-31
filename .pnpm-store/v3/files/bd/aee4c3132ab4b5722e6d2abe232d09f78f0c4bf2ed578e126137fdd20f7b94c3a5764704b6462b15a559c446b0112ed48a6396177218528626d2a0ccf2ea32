import { FileCapabilities, VirtualFile, FileKind, FileRangeCapabilities, MirrorBehaviorCapabilities } from '@volar/language-core';
import { Mapping, Segment } from '@volar/source-map';
import * as CompilerDom from '@vue/compiler-dom';
import { SFCBlock, SFCParseResult, SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from '@vue/compiler-sfc';
import { ComputedRef } from '@vue/reactivity';
import type * as ts from 'typescript/lib/tsserverlibrary';
import { Sfc, SfcBlock, VueLanguagePlugin } from './types';
export declare class VueEmbeddedFile {
    fileName: string;
    parentFileName?: string;
    kind: FileKind;
    capabilities: FileCapabilities;
    content: Segment<FileRangeCapabilities>[];
    extraMappings: Mapping<FileRangeCapabilities>[];
    mirrorBehaviorMappings: Mapping<[MirrorBehaviorCapabilities, MirrorBehaviorCapabilities]>[];
    constructor(fileName: string);
}
export declare class VueFile implements VirtualFile {
    fileName: string;
    snapshot: ts.IScriptSnapshot;
    private ts;
    private plugins;
    parsedSfcCache: {
        snapshot: ts.IScriptSnapshot;
        sfc: SFCParseResult;
        plugin: ReturnType<VueLanguagePlugin>;
    } | undefined;
    compiledSFCTemplateCache: {
        template: string;
        snapshot: ts.IScriptSnapshot;
        result: CompilerDom.CodegenResult;
        plugin: ReturnType<VueLanguagePlugin>;
    } | undefined;
    capabilities: FileCapabilities;
    kind: FileKind;
    mappings: Mapping<FileRangeCapabilities>[];
    get compiledSFCTemplate(): {
        errors: CompilerDom.CompilerError[];
        warnings: CompilerDom.CompilerError[];
        ast: CompilerDom.RootNode | undefined;
    } | undefined;
    get mainScriptName(): string;
    get embeddedFiles(): VirtualFile[];
    sfc: Sfc;
    _sfcBlocks: ComputedRef<Record<string, SfcBlock>>;
    _compiledSfcTemplate: ComputedRef<{
        errors: CompilerDom.CompilerError[];
        warnings: CompilerDom.CompilerError[];
        ast: CompilerDom.RootNode | undefined;
    } | undefined>;
    _pluginEmbeddedFiles: ComputedRef<{
        file: VueEmbeddedFile;
        snapshot: ts.IScriptSnapshot;
        mappings: Mapping<FileRangeCapabilities>[];
    }[]>[];
    _allEmbeddedFiles: ComputedRef<{
        file: VueEmbeddedFile;
        snapshot: ts.IScriptSnapshot;
        mappings: Mapping<FileRangeCapabilities>[];
    }[]>;
    _embeddedFiles: ComputedRef<VirtualFile[]>;
    constructor(fileName: string, snapshot: ts.IScriptSnapshot, ts: typeof import('typescript/lib/tsserverlibrary'), plugins: ReturnType<VueLanguagePlugin>[]);
    update(newScriptSnapshot: ts.IScriptSnapshot): void;
    parseSfc(): SFCParseResult | undefined;
    updateTemplate(block: SFCTemplateBlock | null): void;
    updateScript(block: SFCScriptBlock | null): void;
    updateScriptSetup(block: SFCScriptBlock | null): void;
    updateStyles(blocks: SFCStyleBlock[]): void;
    updateCustomBlocks(blocks: SFCBlock[]): void;
    updateBlock<T>(oldBlock: T, newBlock: T): void;
}
