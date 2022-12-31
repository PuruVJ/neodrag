"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleAttributeDocument = void 0;
const documents_1 = require("../../core/documents");
const language_service_1 = require("./language-service");
const PREFIX = '__ {';
const SUFFIX = '}';
class StyleAttributeDocument extends documents_1.ReadableDocument {
    constructor(parent, attrStart, attrEnd) {
        super();
        this.parent = parent;
        this.attrStart = attrStart;
        this.attrEnd = attrEnd;
        this.version = this.parent.version;
        this.languageId = 'css';
        this.stylesheet = (0, language_service_1.getLanguageService)(this.languageId).parseStylesheet(this);
    }
    /**
     * Get the fragment position relative to the parent
     * @param pos Position in fragment
     */
    getOriginalPosition(pos) {
        const parentOffset = this.attrStart + this.offsetAt(pos) - PREFIX.length;
        return this.parent.positionAt(parentOffset);
    }
    /**
     * Get the position relative to the start of the fragment
     * @param pos Position in parent
     */
    getGeneratedPosition(pos) {
        const fragmentOffset = this.parent.offsetAt(pos) - this.attrStart + PREFIX.length;
        return this.positionAt(fragmentOffset);
    }
    /**
     * Returns true if the given parent position is inside of this fragment
     * @param pos Position in parent
     */
    isInGenerated(pos) {
        const offset = this.parent.offsetAt(pos);
        return offset >= this.attrStart && offset <= this.attrEnd;
    }
    /**
     * Get the fragment text from the parent
     */
    getText() {
        return PREFIX + this.parent.getText().slice(this.attrStart, this.attrEnd) + SUFFIX;
    }
    /**
     * Returns the length of the fragment as calculated from the start and end position
     */
    getTextLength() {
        return PREFIX.length + this.attrEnd - this.attrStart + SUFFIX.length;
    }
    /**
     * Return the parent file path
     */
    getFilePath() {
        return this.parent.getFilePath();
    }
    getURL() {
        return this.parent.getURL();
    }
}
exports.StyleAttributeDocument = StyleAttributeDocument;
