import type { Position, TextDocumentContentChangeEvent } from 'vscode-languageserver';
import { AstroDocument, DocumentMapper, FragmentMapper, IdentityMapper, TagInformation } from '../../../core/documents';
export interface DocumentSnapshot extends ts.IScriptSnapshot {
    version: number;
    filePath: string;
    scriptKind: ts.ScriptKind;
    positionAt(offset: number): Position;
    /**
     * Instantiates a source mapper.
     * `destroyFragment` needs to be called when
     * it's no longer needed / the class should be cleaned up
     * in order to prevent memory leaks.
     */
    createFragment(): Promise<SnapshotFragment>;
    /**
     * Needs to be called when source mapper
     * is no longer needed / the class should be cleaned up
     * in order to prevent memory leaks.
     */
    destroyFragment(): void;
    /**
     * Convenience function for getText(0, getLength())
     */
    getFullText(): string;
}
/**
 * The mapper to get from original snapshot positions to generated and vice versa.
 */
export interface SnapshotFragment extends DocumentMapper {
    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
}
/**
 * Snapshots used for Astro files
 */
export declare class AstroSnapshot implements DocumentSnapshot {
    readonly parent: AstroDocument;
    private readonly text;
    readonly scriptKind: ts.ScriptKind;
    private fragment?;
    version: number;
    scriptTagSnapshots: ScriptTagDocumentSnapshot[];
    constructor(parent: AstroDocument, text: string, scriptKind: ts.ScriptKind);
    createFragment(): Promise<AstroSnapshotFragment>;
    destroyFragment(): null;
    get filePath(): string;
    getText(start: number, end: number): string;
    getLength(): number;
    getFullText(): string;
    getChangeRange(): undefined;
    positionAt(offset: number): Position;
}
export declare class AstroSnapshotFragment implements SnapshotFragment {
    private readonly mapper;
    readonly parent: AstroDocument;
    readonly text: string;
    private readonly url;
    private lineOffsets;
    constructor(mapper: DocumentMapper, parent: AstroDocument, text: string, url: string);
    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
    getOriginalPosition(pos: Position): Position;
    getGeneratedPosition(pos: Position): Position;
    isInGenerated(pos: Position): boolean;
    getURL(): string;
}
export declare class ScriptTagDocumentSnapshot extends FragmentMapper implements DocumentSnapshot, SnapshotFragment {
    scriptTag: TagInformation;
    private readonly parent;
    filePath: string;
    readonly scriptKind: ts.ScriptKind;
    readonly version: number;
    private text;
    private lineOffsets?;
    constructor(scriptTag: TagInformation, parent: AstroDocument, filePath: string, scriptKind: ts.ScriptKind);
    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
    createFragment(): Promise<SnapshotFragment>;
    destroyFragment(): void;
    getText(start: number, end: number): string;
    getLength(): number;
    getFullText(): string;
    getChangeRange(): undefined;
    private getLineOffsets;
}
/**
 * Snapshot used for anything that is not an Astro file
 * It's both used for .js(x)/.ts(x) files and .svelte/.vue files
 */
export declare class TypeScriptDocumentSnapshot extends IdentityMapper implements DocumentSnapshot, SnapshotFragment {
    version: number;
    readonly filePath: string;
    private text;
    readonly supportPartialUpdate: boolean;
    scriptKind: ts.ScriptKind;
    private lineOffsets?;
    constructor(version: number, filePath: string, text: string, scriptKind: ts.ScriptKind, supportPartialUpdate: boolean);
    getText(start: number, end: number): string;
    getLength(): number;
    getFullText(): string;
    getChangeRange(): undefined;
    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
    createFragment(): Promise<this>;
    destroyFragment(): void;
    update(changes: TextDocumentContentChangeEvent[]): void;
    private getLineOffsets;
}
