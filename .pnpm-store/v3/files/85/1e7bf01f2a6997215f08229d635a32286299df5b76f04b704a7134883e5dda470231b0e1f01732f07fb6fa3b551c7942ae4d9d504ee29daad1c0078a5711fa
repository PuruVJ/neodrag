"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttributeContextAtPosition = exports.parseHtml = void 0;
const vscode_html_languageservice_1 = require("vscode-html-languageservice");
const utils_1 = require("./utils");
const parser = (0, vscode_html_languageservice_1.getLanguageService)();
/**
 * Parses text as HTML
 */
function parseHtml(text, frontmatter) {
    const preprocessed = preprocess(text, frontmatter);
    // We can safely only set getText because only this is used for parsing
    const parsedDoc = parser.parseHTMLDocument({ getText: () => preprocessed });
    return parsedDoc;
}
exports.parseHtml = parseHtml;
const createScanner = parser.createScanner;
/**
 * scan the text and remove any `>` or `<` that cause the tag to end short,
 */
function preprocess(text, frontmatter) {
    let scanner = createScanner(text);
    let token = scanner.scan();
    let currentStartTagStart = null;
    const hasFrontmatter = frontmatter !== undefined;
    while (token !== vscode_html_languageservice_1.TokenType.EOS) {
        const offset = scanner.getTokenOffset();
        if (hasFrontmatter &&
            (scanner.getTokenText() === '>' || scanner.getTokenText() === '<') &&
            offset < (frontmatter.content.firstNonWhitespaceOffset ?? 0)) {
            blankStartOrEndTagLike(offset, vscode_html_languageservice_1.ScannerState.WithinContent);
        }
        if (token === vscode_html_languageservice_1.TokenType.StartTagOpen) {
            currentStartTagStart = offset;
        }
        if (token === vscode_html_languageservice_1.TokenType.StartTagClose) {
            if (shouldBlankStartOrEndTagLike(offset)) {
                blankStartOrEndTagLike(offset);
            }
            else {
                currentStartTagStart = null;
            }
        }
        if (token === vscode_html_languageservice_1.TokenType.StartTagSelfClose) {
            currentStartTagStart = null;
        }
        // <Foo checked={a < 1}>
        // https://github.com/microsoft/vscode-html-languageservice/blob/71806ef57be07e1068ee40900ef8b0899c80e68a/src/parser/htmlScanner.ts#L327
        if (token === vscode_html_languageservice_1.TokenType.Unknown &&
            scanner.getScannerState() === vscode_html_languageservice_1.ScannerState.WithinTag &&
            scanner.getTokenText() === '<' &&
            shouldBlankStartOrEndTagLike(offset)) {
            blankStartOrEndTagLike(offset);
        }
        // TODO: Handle TypeScript generics inside expressions / Use the compiler to parse HTML instead?
        token = scanner.scan();
    }
    return text;
    function shouldBlankStartOrEndTagLike(offset) {
        // not null rather than falsy, otherwise it won't work on first tag(0)
        return currentStartTagStart !== null && (0, utils_1.isInsideExpression)(text, currentStartTagStart, offset);
    }
    function blankStartOrEndTagLike(offset, state) {
        text = text.substring(0, offset) + ' ' + text.substring(offset + 1);
        scanner = createScanner(text, offset, state ?? vscode_html_languageservice_1.ScannerState.WithinTag);
    }
}
function getAttributeContextAtPosition(document, position) {
    const offset = document.offsetAt(position);
    const { html } = document;
    const tag = html.findNodeAt(offset);
    if (!inStartTag(offset, tag) || !tag.attributes) {
        return null;
    }
    const text = document.getText();
    const beforeStartTagEnd = text.substring(0, tag.start) + preprocess(text.substring(tag.start, tag.startTagEnd));
    const scanner = createScanner(beforeStartTagEnd, tag.start);
    let token = scanner.scan();
    let currentAttributeName;
    const inTokenRange = () => scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd();
    while (token != vscode_html_languageservice_1.TokenType.EOS) {
        // adopted from https://github.com/microsoft/vscode-html-languageservice/blob/2f7ae4df298ac2c299a40e9024d118f4a9dc0c68/src/services/htmlCompletion.ts#L402
        if (token === vscode_html_languageservice_1.TokenType.AttributeName) {
            currentAttributeName = scanner.getTokenText();
            if (inTokenRange()) {
                return {
                    name: currentAttributeName,
                    inValue: false,
                };
            }
        }
        else if (token === vscode_html_languageservice_1.TokenType.DelimiterAssign) {
            if (scanner.getTokenEnd() === offset && currentAttributeName) {
                const nextToken = scanner.scan();
                return {
                    name: currentAttributeName,
                    inValue: true,
                    valueRange: [offset, nextToken === vscode_html_languageservice_1.TokenType.AttributeValue ? scanner.getTokenEnd() : offset],
                };
            }
        }
        else if (token === vscode_html_languageservice_1.TokenType.AttributeValue) {
            if (inTokenRange() && currentAttributeName) {
                let start = scanner.getTokenOffset();
                let end = scanner.getTokenEnd();
                const char = text[start];
                if (char === '"' || char === "'") {
                    start++;
                    end--;
                }
                return {
                    name: currentAttributeName,
                    inValue: true,
                    valueRange: [start, end],
                };
            }
            currentAttributeName = undefined;
        }
        token = scanner.scan();
    }
    return null;
}
exports.getAttributeContextAtPosition = getAttributeContextAtPosition;
function inStartTag(offset, node) {
    return offset > node.start && node.startTagEnd != undefined && offset < node.startTagEnd;
}
