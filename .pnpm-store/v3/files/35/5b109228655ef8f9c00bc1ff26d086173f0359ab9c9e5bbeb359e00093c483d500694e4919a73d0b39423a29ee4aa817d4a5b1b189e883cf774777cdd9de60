import type { TextDocumentContentChangeEvent } from 'vscode-languageserver';
import type { ConfigManager } from '../../core/config';
import type { AstroDocument, DocumentManager } from '../../core/documents';
import { LanguageServiceContainer, LanguageServiceDocumentContext } from './language-service';
import type { DocumentSnapshot } from './snapshots/DocumentSnapshot';
import { SnapshotManager } from './snapshots/SnapshotManager';
export declare class LanguageServiceManager {
    private readonly docManager;
    private readonly workspaceUris;
    private readonly configManager;
    docContext: LanguageServiceDocumentContext;
    private globalSnapshotManager;
    constructor(docManager: DocumentManager, workspaceUris: string[], configManager: ConfigManager, ts: typeof import('typescript/lib/tsserverlibrary'), tsLocalized?: Record<string, string> | undefined);
    /**
     * Create an AstroDocument (only for astro files)
     */
    private createDocument;
    getSnapshot(document: AstroDocument): Promise<DocumentSnapshot>;
    getSnapshot(pathOrDoc: string | AstroDocument): Promise<DocumentSnapshot>;
    /**
     * Updates snapshot path in all existing ts services and retrieves snapshot
     */
    updateSnapshotPath(oldPath: string, newPath: string): Promise<DocumentSnapshot>;
    /**
     * Deletes snapshot in all existing ts services
     */
    deleteSnapshot(filePath: string): Promise<void>;
    /**
     * Updates project files in all existing ts services
     */
    updateProjectFiles(): Promise<void>;
    /**
     * Updates file in all ts services where it exists
     */
    updateExistingNonAstroFile(path: string, changes?: TextDocumentContentChangeEvent[], text?: string): Promise<void>;
    getLSAndTSDoc(document: AstroDocument): Promise<{
        tsDoc: DocumentSnapshot;
        lang: ts.LanguageService;
    }>;
    getLSForPath(path: string): Promise<import("typescript/lib/tsserverlibrary").LanguageService>;
    getTypeScriptLanguageService(filePath: string): Promise<LanguageServiceContainer>;
    /**
     * @internal Public for tests only
     */
    getSnapshotManager(filePath: string): Promise<SnapshotManager>;
}
