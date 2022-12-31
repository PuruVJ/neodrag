import type { Node, SyntaxKind } from 'typescript';
export declare function readTsConfig(tsConfigPath: string): any;
/**
 * Find a module based on it's import
 *
 * @param importExpr Import used to resolve to a module
 * @param filePath
 * @param tsConfigPath
 */
export declare function resolveModuleByImport(importExpr: string, filePath: string, tsConfigPath: string): any;
export declare function getRootTsConfigFileName(): string | null;
export declare function getRootTsConfigPath(): string | null;
export declare function findNodes(node: Node, kind: SyntaxKind | SyntaxKind[], max?: number): Node[];
