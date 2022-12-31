import type { Connection, Diagnostic, TextDocumentIdentifier } from 'vscode-languageserver';
import type { AstroDocument, DocumentManager } from './documents';
export declare type SendDiagnostics = Connection['sendDiagnostics'];
export declare type GetDiagnostics = (doc: TextDocumentIdentifier) => Thenable<Diagnostic[]>;
export declare class DiagnosticsManager {
    private sendDiagnostics;
    private docManager;
    private getDiagnostics;
    constructor(sendDiagnostics: SendDiagnostics, docManager: DocumentManager, getDiagnostics: GetDiagnostics);
    updateAll(): void;
    update(document: AstroDocument): Promise<void>;
    removeDiagnostics(document: AstroDocument): void;
}
