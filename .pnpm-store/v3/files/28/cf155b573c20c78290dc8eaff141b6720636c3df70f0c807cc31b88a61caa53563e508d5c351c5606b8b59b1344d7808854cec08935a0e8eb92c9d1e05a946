"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldingRangesProviderImpl = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("../utils");
class FoldingRangesProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
        this.ts = languageServiceManager.docContext.ts;
    }
    async getFoldingRanges(document) {
        const html = document.html;
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const outliningSpans = lang.getOutliningSpans(tsDoc.filePath).filter((span) => {
            const node = html.findNodeAt(span.textSpan.start);
            // Due to how our TSX output transform those tags into function calls or template literals
            // TypeScript thinks of those as outlining spans, which is fine but we don't want folding ranges for those
            return node.tag !== 'script' && node.tag !== 'style';
        });
        const scriptOutliningSpans = [];
        document.scriptTags.forEach((scriptTag) => {
            const { snapshot: scriptTagSnapshot, filePath: scriptFilePath } = (0, utils_1.getScriptTagSnapshot)(tsDoc, document, scriptTag.container);
            scriptOutliningSpans.push(...lang.getOutliningSpans(scriptFilePath).map((span) => {
                span.textSpan.start = document.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(span.textSpan.start)));
                return span;
            }));
        });
        const foldingRanges = [];
        for (const span of [...outliningSpans, ...scriptOutliningSpans]) {
            const start = document.positionAt(span.textSpan.start);
            const end = adjustFoldingEnd(start, document.positionAt(span.textSpan.start + span.textSpan.length), document);
            // When using this method for generating folding ranges, TypeScript tend to return some
            // one line / one character ones that we should be able to safely ignore
            if (start.line === end.line && start.character === end.character) {
                continue;
            }
            foldingRanges.push(vscode_languageserver_1.FoldingRange.create(start.line, end.line, start.character, end.character, this.transformFoldingRangeKind(span.kind)));
        }
        return foldingRanges;
    }
    transformFoldingRangeKind(tsKind) {
        switch (tsKind) {
            case this.ts.OutliningSpanKind.Comment:
                return vscode_languageserver_1.FoldingRangeKind.Comment;
            case this.ts.OutliningSpanKind.Imports:
                return vscode_languageserver_1.FoldingRangeKind.Imports;
            case this.ts.OutliningSpanKind.Region:
                return vscode_languageserver_1.FoldingRangeKind.Region;
        }
    }
}
exports.FoldingRangesProviderImpl = FoldingRangesProviderImpl;
// https://github.com/microsoft/vscode/blob/bed61166fb604e519e82e4d1d1ed839bc45d65f8/extensions/typescript-language-features/src/languageFeatures/folding.ts#L61-L73
function adjustFoldingEnd(start, end, document) {
    // workaround for #47240
    if (end.character > 0) {
        const foldEndCharacter = document.getText({
            start: { line: end.line, character: end.character - 1 },
            end,
        });
        if (['}', ']', ')', '`'].includes(foldEndCharacter)) {
            const endOffset = Math.max(document.offsetAt({ line: end.line, character: 0 }) - 1, document.offsetAt(start));
            return document.positionAt(endOffset);
        }
    }
    return end;
}
