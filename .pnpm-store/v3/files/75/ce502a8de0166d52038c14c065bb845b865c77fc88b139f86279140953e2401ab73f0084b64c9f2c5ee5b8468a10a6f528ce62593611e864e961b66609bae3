import { DefaultTasksRunnerOptions } from './default-tasks-runner';
import { ProjectGraph } from '../config/project-graph';
import { NxJsonConfiguration } from '../config/nx-json';
import { Task } from '../config/task-graph';
import { NxArgs } from '../utils/command-line-utils';
export { DefaultTasksRunnerOptions, RemoteCache } from './default-tasks-runner';
/**
 * TODO: Remove after NX 15 is released
 * This tasks runner converts the new implementation of the default tasks runner
 * to the old Observable-based API.
 *
 * It is going to be removed after Nx 15 is released.
 */
export declare const tasksRunnerV2: (tasks: Task[], options: DefaultTasksRunnerOptions, context: {
    target: string;
    initiatingProject?: string;
    projectGraph: ProjectGraph;
    nxJson: NxJsonConfiguration;
    nxArgs: NxArgs;
}) => any;
export default tasksRunnerV2;
