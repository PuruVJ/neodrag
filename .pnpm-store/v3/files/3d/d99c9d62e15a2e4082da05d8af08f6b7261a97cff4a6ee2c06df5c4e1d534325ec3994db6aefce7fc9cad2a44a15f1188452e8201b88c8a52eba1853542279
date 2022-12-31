import type { TextDocumentContentChangeEvent } from 'vscode-languageserver';
import { DocumentSnapshot, TypeScriptDocumentSnapshot } from './DocumentSnapshot';
/**
 * Every snapshot corresponds to a unique file on disk.
 * A snapshot can be part of multiple projects, but for a given file path
 * there can be only one snapshot.
 */
export declare class GlobalSnapshotManager {
    private readonly ts;
    private emitter;
    private documents;
    constructor(ts: typeof import('typescript/lib/tsserverlibrary'));
    get(fileName: string): DocumentSnapshot | undefined;
    set(fileName: string, document: DocumentSnapshot): void;
    delete(fileName: string): void;
    updateNonAstroFile(fileName: string, changes?: TextDocumentContentChangeEvent[], newText?: string): TypeScriptDocumentSnapshot | undefined;
    onChange(listener: (fileName: string, newDocument: DocumentSnapshot | undefined) => void): void;
}
export interface TsFilesSpec {
    include?: readonly string[];
    exclude?: readonly string[];
}
/**
 * Should only be used by `language-service.ts`
 */
export declare class SnapshotManager {
    private globalSnapshotsManager;
    private projectFiles;
    private fileSpec;
    private workspaceRoot;
    private ts;
    private documents;
    private lastLogged;
    constructor(globalSnapshotsManager: GlobalSnapshotManager, projectFiles: string[], fileSpec: TsFilesSpec, workspaceRoot: string, ts: typeof import('typescript/lib/tsserverlibrary'));
    updateProjectFiles(): void;
    updateNonAstroFile(fileName: string, changes?: TextDocumentContentChangeEvent[], text?: string): void;
    has(fileName: string): boolean;
    set(fileName: string, snapshot: DocumentSnapshot): void;
    get(fileName: string): DocumentSnapshot | undefined;
    delete(fileName: string): void;
    getFileNames(): string[];
    getProjectFileNames(): string[];
    private logStatistics;
}
