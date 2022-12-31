"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptDocumentSnapshot = exports.ScriptTagDocumentSnapshot = exports.AstroSnapshotFragment = exports.AstroSnapshot = void 0;
const documents_1 = require("../../../core/documents");
const utils_1 = require("../../../utils");
/**
 * Snapshots used for Astro files
 */
class AstroSnapshot {
    constructor(parent, text, scriptKind) {
        this.parent = parent;
        this.text = text;
        this.scriptKind = scriptKind;
        this.version = this.parent.version;
        this.scriptTagSnapshots = [];
    }
    async createFragment() {
        if (!this.fragment) {
            const uri = (0, utils_1.pathToUrl)(this.filePath);
            this.fragment = new AstroSnapshotFragment(new documents_1.IdentityMapper(uri), this.parent, this.text, uri);
        }
        return this.fragment;
    }
    destroyFragment() {
        return null;
    }
    get filePath() {
        return this.parent.getFilePath() || '';
    }
    getText(start, end) {
        return this.text.substring(start, end);
    }
    getLength() {
        return this.text.length;
    }
    getFullText() {
        return this.text;
    }
    getChangeRange() {
        return undefined;
    }
    positionAt(offset) {
        return (0, documents_1.positionAt)(offset, this.text);
    }
}
exports.AstroSnapshot = AstroSnapshot;
class AstroSnapshotFragment {
    constructor(mapper, parent, text, url) {
        this.mapper = mapper;
        this.parent = parent;
        this.text = text;
        this.url = url;
        this.lineOffsets = (0, documents_1.getLineOffsets)(this.text);
    }
    positionAt(offset) {
        return (0, documents_1.positionAt)(offset, this.text, this.lineOffsets);
    }
    offsetAt(position) {
        return (0, documents_1.offsetAt)(position, this.text, this.lineOffsets);
    }
    getOriginalPosition(pos) {
        return this.mapper.getOriginalPosition(pos);
    }
    getGeneratedPosition(pos) {
        return this.mapper.getGeneratedPosition(pos);
    }
    isInGenerated(pos) {
        throw new Error('Method not implemented.');
    }
    getURL() {
        return this.url;
    }
}
exports.AstroSnapshotFragment = AstroSnapshotFragment;
class ScriptTagDocumentSnapshot extends documents_1.FragmentMapper {
    constructor(scriptTag, parent, filePath, scriptKind) {
        super(parent.getText(), scriptTag, filePath);
        this.scriptTag = scriptTag;
        this.parent = parent;
        this.filePath = filePath;
        this.scriptKind = scriptKind;
        this.version = this.parent.version;
        this.text = this.parent.getText().slice(this.scriptTag.start, this.scriptTag.end) + '\nexport {}';
    }
    positionAt(offset) {
        return (0, documents_1.positionAt)(offset, this.text, this.getLineOffsets());
    }
    offsetAt(position) {
        return (0, documents_1.offsetAt)(position, this.text, this.getLineOffsets());
    }
    async createFragment() {
        return this;
    }
    destroyFragment() {
        //
    }
    getText(start, end) {
        return this.text.substring(start, end);
    }
    getLength() {
        return this.text.length;
    }
    getFullText() {
        return this.text;
    }
    getChangeRange() {
        return undefined;
    }
    getLineOffsets() {
        if (!this.lineOffsets) {
            this.lineOffsets = (0, documents_1.getLineOffsets)(this.text);
        }
        return this.lineOffsets;
    }
}
exports.ScriptTagDocumentSnapshot = ScriptTagDocumentSnapshot;
/**
 * Snapshot used for anything that is not an Astro file
 * It's both used for .js(x)/.ts(x) files and .svelte/.vue files
 */
class TypeScriptDocumentSnapshot extends documents_1.IdentityMapper {
    constructor(version, filePath, text, scriptKind, supportPartialUpdate) {
        super((0, utils_1.pathToUrl)(filePath));
        this.version = version;
        this.filePath = filePath;
        this.text = text;
        this.supportPartialUpdate = supportPartialUpdate;
        this.scriptKind = scriptKind;
    }
    getText(start, end) {
        return this.text.substring(start, end);
    }
    getLength() {
        return this.text.length;
    }
    getFullText() {
        return this.text;
    }
    getChangeRange() {
        return undefined;
    }
    positionAt(offset) {
        return (0, documents_1.positionAt)(offset, this.text, this.getLineOffsets());
    }
    offsetAt(position) {
        return (0, documents_1.offsetAt)(position, this.text, this.getLineOffsets());
    }
    async createFragment() {
        return this;
    }
    destroyFragment() {
        // nothing to clean up
    }
    update(changes) {
        for (const change of changes) {
            let start = 0;
            let end = 0;
            if ('range' in change) {
                start = this.offsetAt(change.range.start);
                end = this.offsetAt(change.range.end);
            }
            else {
                end = this.getLength();
            }
            this.text = this.text.slice(0, start) + change.text + this.text.slice(end);
        }
        this.version++;
        this.lineOffsets = undefined;
    }
    getLineOffsets() {
        if (!this.lineOffsets) {
            this.lineOffsets = (0, documents_1.getLineOffsets)(this.text);
        }
        return this.lineOffsets;
    }
}
exports.TypeScriptDocumentSnapshot = TypeScriptDocumentSnapshot;
