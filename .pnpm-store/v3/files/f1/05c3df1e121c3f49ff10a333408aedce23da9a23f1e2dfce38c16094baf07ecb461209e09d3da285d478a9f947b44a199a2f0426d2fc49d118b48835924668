import { ProjectGraphExternalNode, ProjectGraphProjectNode } from '../config/project-graph';
export declare class TargetProjectLocator {
    private readonly nodes;
    private readonly externalNodes;
    private projectRootMappings;
    private npmProjects;
    private tsConfig;
    private paths;
    private typescriptResolutionCache;
    private npmResolutionCache;
    constructor(nodes: Record<string, ProjectGraphProjectNode>, externalNodes: Record<string, ProjectGraphExternalNode>);
    /**
     * Find a project based on its import
     *
     * @param importExpr
     * @param filePath
     */
    findProjectWithImport(importExpr: string, filePath: string): string;
    /**
     * Return file paths matching the import relative to the repo root
     * @param normalizedImportExpr
     * @returns
     */
    findPaths(normalizedImportExpr: string): string[] | undefined;
    private resolveImportWithTypescript;
    private findNpmPackage;
    private findProjectOfResolvedModule;
    private getAbsolutePath;
    private getRootTsConfig;
    private findMatchingProjectFiles;
}
