(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./cssNavigation", "../parser/cssNodes", "vscode-uri", "../utils/strings"], factory);
    }
})(function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCSSNavigation = void 0;
    const cssNavigation_1 = require("./cssNavigation");
    const nodes = require("../parser/cssNodes");
    const vscode_uri_1 = require("vscode-uri");
    const strings_1 = require("../utils/strings");
    class SCSSNavigation extends cssNavigation_1.CSSNavigation {
        constructor(fileSystemProvider) {
            super(fileSystemProvider, true);
        }
        isRawStringDocumentLinkNode(node) {
            return (super.isRawStringDocumentLinkNode(node) ||
                node.type === nodes.NodeType.Use ||
                node.type === nodes.NodeType.Forward);
        }
        async mapReference(target, isRawLink) {
            if (this.fileSystemProvider && target && isRawLink) {
                const pathVariations = toPathVariations(target);
                for (const variation of pathVariations) {
                    if (await this.fileExists(variation)) {
                        return variation;
                    }
                }
            }
            return target;
        }
        async resolveReference(target, documentUri, documentContext, isRawLink = false) {
            if ((0, strings_1.startsWith)(target, 'sass:')) {
                return undefined; // sass library
            }
            return super.resolveReference(target, documentUri, documentContext, isRawLink);
        }
    }
    exports.SCSSNavigation = SCSSNavigation;
    function toPathVariations(target) {
        // No variation for links that ends with suffix
        if (target.endsWith('.scss') || target.endsWith('.css')) {
            return [target];
        }
        // If a link is like a/, try resolving a/index.scss and a/_index.scss
        if (target.endsWith('/')) {
            return [target + 'index.scss', target + '_index.scss'];
        }
        const targetUri = vscode_uri_1.URI.parse(target);
        const basename = vscode_uri_1.Utils.basename(targetUri);
        const dirname = vscode_uri_1.Utils.dirname(targetUri);
        if (basename.startsWith('_')) {
            // No variation for links such as _a
            return [vscode_uri_1.Utils.joinPath(dirname, basename + '.scss').toString(true)];
        }
        return [
            vscode_uri_1.Utils.joinPath(dirname, basename + '.scss').toString(true),
            vscode_uri_1.Utils.joinPath(dirname, '_' + basename + '.scss').toString(true),
            target + '/index.scss',
            target + '/_index.scss',
            vscode_uri_1.Utils.joinPath(dirname, basename + '.css').toString(true)
        ];
    }
});
