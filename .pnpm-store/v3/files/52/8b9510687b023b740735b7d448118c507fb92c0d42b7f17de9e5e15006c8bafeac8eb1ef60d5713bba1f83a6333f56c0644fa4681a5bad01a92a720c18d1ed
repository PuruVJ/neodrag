import { CancellationToken, DiagnosticSeverity } from 'vscode-languageserver';
import { Diagnostic } from 'vscode-languageserver-types';
import { AstroDocument } from '../../../core/documents';
import type { DiagnosticsProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare enum DiagnosticCodes {
    SPREAD_EXPECTED = 1005,
    IS_NOT_A_MODULE = 2306,
    DUPLICATED_JSX_ATTRIBUTES = 17001,
    MUST_HAVE_PARENT_ELEMENT = 2657,
    CANT_RETURN_OUTSIDE_FUNC = 1108,
    ISOLATED_MODULE_COMPILE_ERR = 1208,
    TYPE_NOT_ASSIGNABLE = 2322,
    JSX_NO_CLOSING_TAG = 17008,
    JSX_ELEMENT_NO_CALL = 2604
}
export declare class DiagnosticsProviderImpl implements DiagnosticsProvider {
    private languageServiceManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager);
    getDiagnostics(document: AstroDocument, _cancellationToken?: CancellationToken): Promise<Diagnostic[]>;
    private getTagBoundaries;
    mapSeverity(category: ts.DiagnosticCategory): DiagnosticSeverity;
}
