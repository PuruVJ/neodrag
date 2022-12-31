"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WritableDocument = exports.ReadableDocument = void 0;
const utils_1 = require("./utils");
/**
 * Represents a textual document.
 */
class ReadableDocument {
    constructor() {
        /**
         * Current version of the document.
         */
        this.version = 0;
    }
    /**
     * Get the length of the document's content
     */
    getTextLength() {
        return this.getText().length;
    }
    /**
     * Get the line and character based on the offset
     * @param offset The index of the position
     */
    positionAt(offset) {
        return (0, utils_1.positionAt)(offset, this.getText(), this.getLineOffsets());
    }
    /**
     * Get the index of the line and character position
     * @param position Line and character position
     */
    offsetAt(position) {
        return (0, utils_1.offsetAt)(position, this.getText(), this.getLineOffsets());
    }
    getLineUntilOffset(offset) {
        const { line, character } = this.positionAt(offset);
        return this.lines[line].slice(0, character);
    }
    getLineOffsets() {
        if (!this.lineOffsets) {
            this.lineOffsets = (0, utils_1.getLineOffsets)(this.getText());
        }
        return this.lineOffsets;
    }
    /**
     * Implements TextDocument
     */
    get uri() {
        return this.getURL();
    }
    get lines() {
        return this.getText().split(/\r?\n/);
    }
    get lineCount() {
        return this.lines.length;
    }
}
exports.ReadableDocument = ReadableDocument;
/**
 * Represents a textual document that can be manipulated.
 */
class WritableDocument extends ReadableDocument {
    /**
     * Update the text between two positions.
     * @param text The new text slice
     * @param start Start offset of the new text
     * @param end End offset of the new text
     */
    update(text, start, end) {
        this.lineOffsets = undefined;
        const content = this.getText();
        this.setText(content.slice(0, start) + text + content.slice(end));
    }
}
exports.WritableDocument = WritableDocument;
