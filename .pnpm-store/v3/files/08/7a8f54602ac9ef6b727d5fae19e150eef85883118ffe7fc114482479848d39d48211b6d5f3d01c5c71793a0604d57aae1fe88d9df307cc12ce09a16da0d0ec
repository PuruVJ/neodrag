"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSelectors = exports.NodeType = exports.getIdClassCompletion = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
function getIdClassCompletion(stylesheets, attributeContext) {
    const collectingType = getCollectingType(attributeContext);
    if (!collectingType) {
        return null;
    }
    const items = collectSelectors(stylesheets, collectingType);
    return vscode_languageserver_1.CompletionList.create(items);
}
exports.getIdClassCompletion = getIdClassCompletion;
function getCollectingType(attributeContext) {
    if (attributeContext.inValue) {
        if (attributeContext.name === 'class') {
            return NodeType.ClassSelector;
        }
        if (attributeContext.name === 'id') {
            return NodeType.IdentifierSelector;
        }
    }
    else if (attributeContext.name.startsWith('class:')) {
        return NodeType.ClassSelector;
    }
}
/**
 * incomplete see
 * https://github.com/microsoft/vscode-css-languageservice/blob/master/src/parser/cssNodes.ts#L14
 * The enum is not exported. we have to update this whenever it changes
 */
var NodeType;
(function (NodeType) {
    NodeType[NodeType["ClassSelector"] = 14] = "ClassSelector";
    NodeType[NodeType["IdentifierSelector"] = 15] = "IdentifierSelector";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
function collectSelectors(stylesheets, type) {
    const result = [];
    stylesheets.forEach((stylesheet) => {
        walk(stylesheet, (node) => {
            if (node.type === type) {
                result.push(node);
            }
        });
    });
    return result.map((node) => ({
        label: node.getText().substring(1),
        kind: vscode_languageserver_1.CompletionItemKind.Keyword,
    }));
}
exports.collectSelectors = collectSelectors;
function walk(node, callback) {
    callback(node);
    if (node.children) {
        node.children.forEach((childrenNode) => walk(childrenNode, callback));
    }
}
