"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsManager = void 0;
class DiagnosticsManager {
    constructor(sendDiagnostics, docManager, getDiagnostics) {
        this.sendDiagnostics = sendDiagnostics;
        this.docManager = docManager;
        this.getDiagnostics = getDiagnostics;
    }
    updateAll() {
        this.docManager.getAllOpenedByClient().forEach((doc) => {
            this.update(doc[1]);
        });
    }
    async update(document) {
        const diagnostics = await this.getDiagnostics({ uri: document.getURL() });
        this.sendDiagnostics({
            uri: document.getURL(),
            diagnostics,
        });
    }
    removeDiagnostics(document) {
        this.sendDiagnostics({
            uri: document.getURL(),
            diagnostics: [],
        });
    }
}
exports.DiagnosticsManager = DiagnosticsManager;
