"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentManager = void 0;
const events_1 = require("events");
const utils_1 = require("../../utils");
const AstroDocument_1 = require("./AstroDocument");
class DocumentManager {
    constructor(createDocument) {
        this.createDocument = createDocument;
        this.emitter = new events_1.EventEmitter();
        this.openedInClient = new Set();
        this.documents = new Map();
        this.locked = new Set();
        this.deleteCandidates = new Set();
        if (!createDocument) {
            this.createDocument = (textDocument) => new AstroDocument_1.AstroDocument(textDocument.uri, textDocument.text);
        }
    }
    openDocument(textDocument) {
        textDocument = { ...textDocument, uri: (0, utils_1.normalizeUri)(textDocument.uri) };
        let document;
        if (this.documents.has(textDocument.uri)) {
            document = this.documents.get(textDocument.uri);
            document.setText(textDocument.text);
        }
        else {
            document = this.createDocument(textDocument);
            this.documents.set(textDocument.uri, document);
            this.notify('documentOpen', document);
        }
        this.notify('documentChange', document);
        return document;
    }
    lockDocument(uri) {
        this.locked.add((0, utils_1.normalizeUri)(uri));
    }
    markAsOpenedInClient(uri) {
        this.openedInClient.add((0, utils_1.normalizeUri)(uri));
    }
    getAllOpenedByClient() {
        return Array.from(this.documents.entries()).filter((doc) => this.openedInClient.has(doc[0]));
    }
    releaseDocument(uri) {
        uri = (0, utils_1.normalizeUri)(uri);
        this.locked.delete(uri);
        this.openedInClient.delete(uri);
        if (this.deleteCandidates.has(uri)) {
            this.deleteCandidates.delete(uri);
            this.closeDocument(uri);
        }
    }
    closeDocument(uri) {
        uri = (0, utils_1.normalizeUri)(uri);
        const document = this.documents.get(uri);
        if (!document) {
            throw new Error('Cannot call methods on an unopened document');
        }
        this.notify('documentClose', document);
        // Some plugin may prevent a document from actually being closed.
        if (!this.locked.has(uri)) {
            this.documents.delete(uri);
        }
        else {
            this.deleteCandidates.add(uri);
        }
        this.openedInClient.delete(uri);
    }
    updateDocument(textDocument, changes) {
        const document = this.documents.get((0, utils_1.normalizeUri)(textDocument.uri));
        if (!document) {
            throw new Error('Cannot call methods on an unopened document');
        }
        for (const change of changes) {
            let start = 0;
            let end = 0;
            if ('range' in change) {
                start = document.offsetAt(change.range.start);
                end = document.offsetAt(change.range.end);
            }
            else {
                end = document.getTextLength();
            }
            document.update(change.text, start, end);
        }
        this.notify('documentChange', document);
    }
    on(name, listener) {
        this.emitter.on(name, listener);
    }
    get(uri) {
        return this.documents.get((0, utils_1.normalizeUri)(uri));
    }
    notify(name, document) {
        this.emitter.emit(name, document);
    }
    static newInstance() {
        return new DocumentManager(({ uri, text }) => new AstroDocument_1.AstroDocument(uri, text));
    }
}
exports.DocumentManager = DocumentManager;
