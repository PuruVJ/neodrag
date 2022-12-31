import { TasksRunner } from './tasks-runner';
import { LifeCycle } from './life-cycle';
export interface RemoteCache {
    retrieve: (hash: string, cacheDirectory: string) => Promise<boolean>;
    store: (hash: string, cacheDirectory: string) => Promise<boolean>;
}
export interface DefaultTasksRunnerOptions {
    parallel?: number;
    cacheableOperations?: string[];
    cacheableTargets?: string[];
    runtimeCacheInputs?: string[];
    cacheDirectory?: string;
    remoteCache?: RemoteCache;
    lifeCycle: LifeCycle;
    captureStderr?: boolean;
    skipNxCache?: boolean;
}
export declare const defaultTasksRunner: TasksRunner<DefaultTasksRunnerOptions>;
export default defaultTasksRunner;
