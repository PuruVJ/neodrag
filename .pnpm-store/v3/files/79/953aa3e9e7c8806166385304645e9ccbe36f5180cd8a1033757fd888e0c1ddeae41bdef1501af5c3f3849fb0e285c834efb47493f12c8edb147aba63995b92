import type { TextDocumentContentChangeEvent, TextDocumentItem, VersionedTextDocumentIdentifier } from 'vscode-languageserver';
import { AstroDocument } from './AstroDocument';
export declare type DocumentEvent = 'documentOpen' | 'documentChange' | 'documentClose';
export declare class DocumentManager {
    private createDocument?;
    private emitter;
    private openedInClient;
    private documents;
    private locked;
    private deleteCandidates;
    constructor(createDocument?: ((textDocument: Pick<TextDocumentItem, 'text' | 'uri'>) => AstroDocument) | undefined);
    openDocument(textDocument: Pick<TextDocumentItem, 'text' | 'uri'>): AstroDocument;
    lockDocument(uri: string): void;
    markAsOpenedInClient(uri: string): void;
    getAllOpenedByClient(): [string, AstroDocument][];
    releaseDocument(uri: string): void;
    closeDocument(uri: string): void;
    updateDocument(textDocument: VersionedTextDocumentIdentifier, changes: TextDocumentContentChangeEvent[]): void;
    on(name: DocumentEvent, listener: (document: AstroDocument) => void): void;
    get(uri: string): AstroDocument | undefined;
    private notify;
    static newInstance(): DocumentManager;
}
