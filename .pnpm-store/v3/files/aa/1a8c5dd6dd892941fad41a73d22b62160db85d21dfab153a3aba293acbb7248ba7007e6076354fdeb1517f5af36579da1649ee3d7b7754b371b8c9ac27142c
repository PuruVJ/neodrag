import type ts from 'typescript';
import { FoldingRange } from 'vscode-languageserver';
import type { AstroDocument } from '../../../core/documents';
import type { FoldingRangesProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class FoldingRangesProviderImpl implements FoldingRangesProvider {
    private languageServiceManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager);
    getFoldingRanges(document: AstroDocument): Promise<FoldingRange[] | null>;
    transformFoldingRangeKind(tsKind: ts.OutliningSpanKind): "imports" | "comment" | "region" | undefined;
}
