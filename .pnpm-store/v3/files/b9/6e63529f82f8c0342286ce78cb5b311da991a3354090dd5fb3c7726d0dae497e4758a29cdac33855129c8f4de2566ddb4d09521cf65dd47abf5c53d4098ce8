/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../htmlLanguageTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findDocumentSymbols = void 0;
    var htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    function findDocumentSymbols(document, htmlDocument) {
        var symbols = [];
        htmlDocument.roots.forEach(function (node) {
            provideFileSymbolsInternal(document, node, '', symbols);
        });
        return symbols;
    }
    exports.findDocumentSymbols = findDocumentSymbols;
    function provideFileSymbolsInternal(document, node, container, symbols) {
        var name = nodeToName(node);
        var location = htmlLanguageTypes_1.Location.create(document.uri, htmlLanguageTypes_1.Range.create(document.positionAt(node.start), document.positionAt(node.end)));
        var symbol = {
            name: name,
            location: location,
            containerName: container,
            kind: htmlLanguageTypes_1.SymbolKind.Field
        };
        symbols.push(symbol);
        node.children.forEach(function (child) {
            provideFileSymbolsInternal(document, child, name, symbols);
        });
    }
    function nodeToName(node) {
        var name = node.tag;
        if (node.attributes) {
            var id = node.attributes['id'];
            var classes = node.attributes['class'];
            if (id) {
                name += "#".concat(id.replace(/[\"\']/g, ''));
            }
            if (classes) {
                name += classes.replace(/[\"\']/g, '').split(/\s+/).map(function (className) { return ".".concat(className); }).join('');
            }
        }
        return name || '?';
    }
});
