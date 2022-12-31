"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAstro = void 0;
const utils_1 = require("./utils");
/** Parses a document to collect metadata about Astro features */
function parseAstro(content) {
    const frontmatter = getFrontmatter(content);
    return {
        frontmatter,
        content: getContent(content, frontmatter),
    };
}
exports.parseAstro = parseAstro;
/** Get frontmatter metadata */
function getFrontmatter(content) {
    /** Quickly check how many `---` blocks are in the document */
    function getFrontmatterState() {
        const parts = content.trim().split('---').length;
        switch (parts) {
            case 1:
                return null;
            case 2:
                return 'open';
            default:
                return 'closed';
        }
    }
    const state = getFrontmatterState();
    /** Construct a range containing the document's frontmatter */
    function getFrontmatterOffsets() {
        const startOffset = content.indexOf('---');
        if (startOffset === -1)
            return [null, null];
        const endOffset = content.slice(startOffset + 3).indexOf('---') + 3;
        if (endOffset === -1)
            return [startOffset, null];
        return [startOffset, endOffset];
    }
    const [startOffset, endOffset] = getFrontmatterOffsets();
    return {
        state,
        startOffset,
        endOffset,
    };
}
/** Get content metadata */
function getContent(content, frontmatter) {
    switch (frontmatter.state) {
        case null: {
            const offset = (0, utils_1.getFirstNonWhitespaceIndex)(content);
            return { firstNonWhitespaceOffset: offset === -1 ? null : offset };
        }
        case 'open': {
            return { firstNonWhitespaceOffset: null };
        }
        case 'closed': {
            const { endOffset } = frontmatter;
            const end = (endOffset ?? 0) + 3;
            const offset = (0, utils_1.getFirstNonWhitespaceIndex)(content.slice(end));
            return { firstNonWhitespaceOffset: end + offset };
        }
    }
}
