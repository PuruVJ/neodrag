"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findContainingNode = exports.SnapshotFragmentMap = exports.isPartOfImportStatement = void 0;
const documents_1 = require("../../../core/documents");
function isPartOfImportStatement(text, position) {
    const line = (0, documents_1.getLineAtPosition)(position, text);
    return /\s*from\s+["'][^"']*/.test(line.slice(0, position.character));
}
exports.isPartOfImportStatement = isPartOfImportStatement;
class SnapshotFragmentMap {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
        this.map = new Map();
    }
    set(fileName, content) {
        this.map.set(fileName, content);
    }
    get(fileName) {
        return this.map.get(fileName);
    }
    getFragment(fileName) {
        return this.map.get(fileName)?.fragment;
    }
    async retrieve(fileName) {
        let snapshotFragment = this.get(fileName);
        if (!snapshotFragment) {
            const snapshot = await this.languageServiceManager.getSnapshot(fileName);
            const fragment = await snapshot.createFragment();
            snapshotFragment = { fragment, snapshot };
            this.set(fileName, snapshotFragment);
        }
        return snapshotFragment;
    }
    async retrieveFragment(fileName) {
        return (await this.retrieve(fileName)).fragment;
    }
}
exports.SnapshotFragmentMap = SnapshotFragmentMap;
function findContainingNode(node, textSpan, predicate) {
    const children = node.getChildren();
    const end = textSpan.start + textSpan.length;
    for (const child of children) {
        if (!(child.getStart() <= textSpan.start && child.getEnd() >= end)) {
            continue;
        }
        if (predicate(child)) {
            return child;
        }
        const foundInChildren = findContainingNode(child, textSpan, predicate);
        if (foundInChildren) {
            return foundInChildren;
        }
    }
}
exports.findContainingNode = findContainingNode;
