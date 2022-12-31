import type { Diagnostic } from 'vscode-languageserver-types';
import { LSConfig } from './core/config';
export { DiagnosticSeverity } from 'vscode-languageserver-types';
export { Diagnostic };
export interface GetDiagnosticsResult {
    fileUri: string;
    text: string;
    diagnostics: Diagnostic[];
}
export declare class AstroCheck {
    private docManager;
    private configManager;
    private pluginHost;
    constructor(workspacePath: string, typescriptPath: string, options?: LSConfig);
    upsertDocument(doc: {
        text: string;
        uri: string;
    }): void;
    removeDocument(uri: string): void;
    getDiagnostics(): Promise<GetDiagnosticsResult[]>;
    private initialize;
    private getDiagnosticsForFile;
}
