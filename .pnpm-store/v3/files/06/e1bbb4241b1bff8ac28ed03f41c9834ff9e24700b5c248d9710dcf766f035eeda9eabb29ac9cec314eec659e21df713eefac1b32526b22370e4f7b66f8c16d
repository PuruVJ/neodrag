import { NxJsonConfiguration } from '../config/nx-json';
import { ProjectsConfigurations, TargetDependencyConfig } from '../config/workspace-json-project-json';
export declare function runOne(cwd: string, args: {
    [k: string]: any;
}, extraTargetDependencies?: Record<string, (TargetDependencyConfig | string)[]>, extraOptions?: {
    excludeTaskDependencies: boolean;
    loadDotEnvFiles: boolean;
}): Promise<void>;
export declare function calculateDefaultProjectName(cwd: string, root: string, workspaceConfiguration: ProjectsConfigurations & NxJsonConfiguration): string;
