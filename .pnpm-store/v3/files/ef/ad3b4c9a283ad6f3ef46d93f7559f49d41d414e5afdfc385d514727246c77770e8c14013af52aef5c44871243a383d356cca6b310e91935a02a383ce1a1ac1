import { DependencyType } from '../../config/project-graph';
export declare class TypeScriptImportLocator {
    private readonly scanner;
    constructor();
    fromFile(filePath: string, visitor: (importExpr: string, filePath: string, type: DependencyType) => void): void;
    fromNode(filePath: string, node: any, visitor: (importExpr: string, filePath: string, type: DependencyType) => void): void;
    private ignoreStatement;
    private ignoreLoadChildrenDependency;
    private getPropertyAssignmentName;
    private getStringLiteralValue;
}
