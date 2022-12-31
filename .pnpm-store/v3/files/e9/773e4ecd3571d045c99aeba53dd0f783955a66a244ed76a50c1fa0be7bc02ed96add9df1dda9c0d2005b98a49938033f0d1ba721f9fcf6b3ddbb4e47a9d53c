import * as vscode from 'vscode-languageserver';
export interface RuntimeEnvironment {
    loadTypescript: (initOptions: any) => typeof import('typescript/lib/tsserverlibrary');
    loadTypescriptLocalized: (initOptions: any) => Record<string, string> | undefined;
}
export declare function startLanguageServer(connection: vscode.Connection, env: RuntimeEnvironment): void;
