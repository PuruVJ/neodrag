"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstNonWhitespaceIndex = exports.getLineOffsets = exports.offsetAt = exports.positionAt = exports.isInsideFrontmatter = exports.isInsideExpression = exports.isInTag = exports.isPossibleComponent = exports.isInTagName = exports.isInComponentStartTag = exports.getLineAtPosition = exports.extractScriptTags = exports.extractStyleTags = exports.walk = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("../../utils");
function* walk(node) {
    for (let child of node.children) {
        yield* walk(child);
    }
    yield node;
}
exports.walk = walk;
/**
 * Extracts a tag (style or script) from the given text
 * and returns its start, end and the attributes on that tag.
 *
 * @param source text content to extract tag from
 * @param tag the tag to extract
 */
function extractTags(text, tag, html) {
    const rootNodes = html.roots;
    const matchedNodes = rootNodes.filter((node) => node.tag === tag);
    if (tag === 'style' && !matchedNodes.length && rootNodes.length) {
        for (let child of walk(rootNodes[0])) {
            if (child.tag === 'style') {
                matchedNodes.push(child);
            }
        }
    }
    if (tag === 'script' && !matchedNodes.length && rootNodes.length) {
        for (let child of walk(rootNodes[0])) {
            if (child.tag === 'script') {
                matchedNodes.push(child);
            }
        }
    }
    return matchedNodes.map(transformToTagInfo);
    function transformToTagInfo(matchedNode) {
        const start = matchedNode.startTagEnd ?? matchedNode.start;
        const end = matchedNode.endTagStart ?? matchedNode.end;
        const startPos = positionAt(start, text);
        const endPos = positionAt(end, text);
        const container = {
            start: matchedNode.start,
            end: matchedNode.end,
        };
        const content = text.substring(start, end);
        return {
            content,
            attributes: parseAttributes(matchedNode.attributes),
            start,
            end,
            startPos,
            endPos,
            container,
            // vscode-html-languageservice types does not contain this, despite it existing. Annoying
            closed: matchedNode.closed,
        };
    }
}
function extractStyleTags(source, html) {
    const styles = extractTags(source, 'style', html);
    if (!styles.length) {
        return [];
    }
    return styles;
}
exports.extractStyleTags = extractStyleTags;
function extractScriptTags(source, html) {
    const scripts = extractTags(source, 'script', html);
    if (!scripts.length) {
        return [];
    }
    return scripts;
}
exports.extractScriptTags = extractScriptTags;
function parseAttributes(rawAttrs) {
    const attrs = {};
    if (!rawAttrs) {
        return attrs;
    }
    Object.keys(rawAttrs).forEach((attrName) => {
        const attrValue = rawAttrs[attrName];
        attrs[attrName] = attrValue === null ? attrName : removeOuterQuotes(attrValue);
    });
    return attrs;
    function removeOuterQuotes(attrValue) {
        if ((attrValue.startsWith('"') && attrValue.endsWith('"')) ||
            (attrValue.startsWith("'") && attrValue.endsWith("'"))) {
            return attrValue.slice(1, attrValue.length - 1);
        }
        return attrValue;
    }
}
function getLineAtPosition(position, text) {
    return text.substring(offsetAt({ line: position.line, character: 0 }, text), offsetAt({ line: position.line, character: Number.MAX_VALUE }, text));
}
exports.getLineAtPosition = getLineAtPosition;
/**
 * Return if a given offset is inside the start tag of a component
 */
function isInComponentStartTag(html, offset) {
    const node = html.findNodeAt(offset);
    return isPossibleComponent(node) && (!node.startTagEnd || offset < node.startTagEnd);
}
exports.isInComponentStartTag = isInComponentStartTag;
/**
 * Return if a given offset is inside the name of a tag
 */
function isInTagName(html, offset) {
    const node = html.findNodeAt(offset);
    return offset > node.start && offset < node.start + (node.tag?.length ?? 0);
}
exports.isInTagName = isInTagName;
/**
 * Return true if a specific node could be a component.
 * This is not a 100% sure test as it'll return false for any component that does not match the standard format for a component
 */
function isPossibleComponent(node) {
    return !!node.tag?.[0].match(/[A-Z]/) || !!node.tag?.match(/.+[.][A-Z]?/);
}
exports.isPossibleComponent = isPossibleComponent;
/**
 * Return if the current position is in a specific tag
 */
function isInTag(position, tagInfo) {
    return !!tagInfo && (0, utils_1.isInRange)(vscode_languageserver_1.Range.create(tagInfo.startPos, tagInfo.endPos), position);
}
exports.isInTag = isInTag;
/**
 * Return if a given position is inside a JSX expression
 */
function isInsideExpression(html, tagStart, position) {
    const charactersInNode = html.substring(tagStart, position);
    return charactersInNode.lastIndexOf('{') > charactersInNode.lastIndexOf('}');
}
exports.isInsideExpression = isInsideExpression;
/**
 * Returns if a given offset is inside of the document frontmatter
 */
function isInsideFrontmatter(text, offset) {
    let start = text.slice(0, offset).trim().split('---').length;
    let end = text.slice(offset).trim().split('---').length;
    return start > 1 && start < 3 && end >= 1;
}
exports.isInsideFrontmatter = isInsideFrontmatter;
/**
 * Get the line and character based on the offset
 * @param offset The index of the position
 * @param text The text for which the position should be retrived
 * @param lineOffsets number Array with offsets for each line. Computed if not given
 */
function positionAt(offset, text, lineOffsets = getLineOffsets(text)) {
    offset = (0, utils_1.clamp)(offset, 0, text.length);
    let low = 0;
    let high = lineOffsets.length;
    if (high === 0) {
        return vscode_languageserver_1.Position.create(0, offset);
    }
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const lineOffset = lineOffsets[mid];
        if (lineOffset === offset) {
            return vscode_languageserver_1.Position.create(mid, 0);
        }
        else if (offset > lineOffset) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    // low is the least x for which the line offset is larger than the current offset
    // or array.length if no line offset is larger than the current offset
    const line = low - 1;
    return vscode_languageserver_1.Position.create(line, offset - lineOffsets[line]);
}
exports.positionAt = positionAt;
/**
 * Get the offset of the line and character position
 * @param position Line and character position
 * @param text The text for which the offset should be retrived
 * @param lineOffsets number Array with offsets for each line. Computed if not given
 */
function offsetAt(position, text, lineOffsets = getLineOffsets(text)) {
    if (position.line >= lineOffsets.length) {
        return text.length;
    }
    else if (position.line < 0) {
        return 0;
    }
    const lineOffset = lineOffsets[position.line];
    const nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : text.length;
    return (0, utils_1.clamp)(nextLineOffset, lineOffset, lineOffset + position.character);
}
exports.offsetAt = offsetAt;
function getLineOffsets(text) {
    const lineOffsets = [];
    let isLineStart = true;
    for (let i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        const ch = text.charAt(i);
        isLineStart = ch === '\r' || ch === '\n';
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}
exports.getLineOffsets = getLineOffsets;
/**
 * Gets index of first-non-whitespace character.
 */
function getFirstNonWhitespaceIndex(str) {
    return str.length - str.trimStart().length;
}
exports.getFirstNonWhitespaceIndex = getFirstNonWhitespaceIndex;
