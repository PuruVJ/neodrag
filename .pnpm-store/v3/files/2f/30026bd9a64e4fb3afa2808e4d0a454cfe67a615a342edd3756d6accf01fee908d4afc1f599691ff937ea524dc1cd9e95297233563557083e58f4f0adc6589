import { FileData, ProjectFileMap } from '../../config/project-graph';
import { ProjectGraphCache } from '../../project-graph/nx-deps-cache';
export declare let projectFileMapWithFiles: {
    projectFileMap: ProjectFileMap;
    allWorkspaceFiles: FileData[];
} | undefined;
export declare let currentProjectGraphCache: ProjectGraphCache | undefined;
export declare function getCachedSerializedProjectGraphPromise(): Promise<{
    error: Error;
    serializedProjectGraph: string;
} | {
    error: any;
    serializedProjectGraph: any;
}>;
export declare function addUpdatedAndDeletedFiles(createdFiles: string[], updatedFiles: string[], deletedFiles: string[]): void;
