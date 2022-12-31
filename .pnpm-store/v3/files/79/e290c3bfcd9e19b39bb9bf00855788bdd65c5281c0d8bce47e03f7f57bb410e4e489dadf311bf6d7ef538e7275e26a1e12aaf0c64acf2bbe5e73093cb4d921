import { NxJsonConfiguration } from '../config/nx-json';
import { FileData } from '../config/project-graph';
import { ProjectsConfigurations } from '../config/workspace-json-project-json';
import type { NxArgs } from '../utils/command-line-utils';
export interface Change {
    type: string;
}
export interface FileChange<T extends Change = Change> extends FileData {
    getChanges: () => T[];
}
export declare class WholeFileChange implements Change {
    type: string;
}
export declare class DeletedFileChange implements Change {
    type: string;
}
export declare function isWholeFileChange(change: Change): change is WholeFileChange;
export declare function isDeletedFileChange(change: Change): change is DeletedFileChange;
export declare function readFileIfExisting(path: string): string;
export declare function calculateFileChanges(files: string[], allWorkspaceFiles: FileData[], nxArgs?: NxArgs, readFileAtRevision?: (f: string, r: void | string) => string, ignore?: import("ignore").Ignore): FileChange[];
export declare const TEN_MEGABYTES: number;
export declare function readWorkspaceConfig(opts: {
    format: 'angularCli' | 'nx';
    path?: string;
}): ProjectsConfigurations & NxJsonConfiguration;
export declare function workspaceFileName(): "angular.json" | "workspace.json";
export declare function defaultFileRead(filePath: string): string | null;
export declare function readPackageJson(): any;
export { FileData };
export { readNxJson, readAllWorkspaceConfiguration, workspaceLayout, } from '../config/configuration';
