import { TasksRunner } from './tasks-runner';
import { NxArgs } from '../utils/command-line-utils';
import { ProjectGraph, ProjectGraphProjectNode } from '../config/project-graph';
import { NxJsonConfiguration } from '../config/nx-json';
import { TargetDependencyConfig } from '../config/workspace-json-project-json';
export declare function runCommand(projectsToRun: ProjectGraphProjectNode[], projectGraph: ProjectGraph, { nxJson }: {
    nxJson: NxJsonConfiguration;
}, nxArgs: NxArgs, overrides: any, initiatingProject: string | null, extraTargetDependencies: Record<string, (TargetDependencyConfig | string)[]>, extraOptions: {
    excludeTaskDependencies: boolean;
    loadDotEnvFiles: boolean;
}): Promise<void>;
export declare function getRunner(nxArgs: NxArgs, nxJson: NxJsonConfiguration): {
    tasksRunner: TasksRunner;
    runnerOptions: any;
};
