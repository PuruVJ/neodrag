/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { CSSNavigation } from './cssNavigation';
import * as nodes from '../parser/cssNodes';
import { URI, Utils } from 'vscode-uri';
import { startsWith } from '../utils/strings';
export class SCSSNavigation extends CSSNavigation {
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
        if (startsWith(target, 'sass:')) {
            return undefined; // sass library
        }
        return super.resolveReference(target, documentUri, documentContext, isRawLink);
    }
}
function toPathVariations(target) {
    // No variation for links that ends with suffix
    if (target.endsWith('.scss') || target.endsWith('.css')) {
        return [target];
    }
    // If a link is like a/, try resolving a/index.scss and a/_index.scss
    if (target.endsWith('/')) {
        return [target + 'index.scss', target + '_index.scss'];
    }
    const targetUri = URI.parse(target);
    const basename = Utils.basename(targetUri);
    const dirname = Utils.dirname(targetUri);
    if (basename.startsWith('_')) {
        // No variation for links such as _a
        return [Utils.joinPath(dirname, basename + '.scss').toString(true)];
    }
    return [
        Utils.joinPath(dirname, basename + '.scss').toString(true),
        Utils.joinPath(dirname, '_' + basename + '.scss').toString(true),
        target + '/index.scss',
        target + '/_index.scss',
        Utils.joinPath(dirname, basename + '.css').toString(true)
    ];
}
