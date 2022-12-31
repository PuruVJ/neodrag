import type ts from 'typescript';
import type { Position } from 'vscode-languageserver';
import type { LanguageServiceManager } from '../LanguageServiceManager';
import type { DocumentSnapshot, SnapshotFragment } from '../snapshots/DocumentSnapshot';
export declare function isPartOfImportStatement(text: string, position: Position): boolean;
export declare class SnapshotFragmentMap {
    private languageServiceManager;
    private map;
    constructor(languageServiceManager: LanguageServiceManager);
    set(fileName: string, content: {
        fragment: SnapshotFragment;
        snapshot: DocumentSnapshot;
    }): void;
    get(fileName: string): {
        fragment: SnapshotFragment;
        snapshot: DocumentSnapshot;
    } | undefined;
    getFragment(fileName: string): SnapshotFragment | undefined;
    retrieve(fileName: string): Promise<{
        fragment: SnapshotFragment;
        snapshot: DocumentSnapshot;
    }>;
    retrieveFragment(fileName: string): Promise<SnapshotFragment>;
}
export declare function findContainingNode<T extends ts.Node>(node: ts.Node, textSpan: ts.TextSpan, predicate: (node: ts.Node) => node is T): T | undefined;
