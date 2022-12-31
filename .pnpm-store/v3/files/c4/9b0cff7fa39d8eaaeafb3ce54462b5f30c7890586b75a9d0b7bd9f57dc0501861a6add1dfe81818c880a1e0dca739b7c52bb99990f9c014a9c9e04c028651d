import { DefaultTasksRunnerOptions } from './default-tasks-runner';
import { Task } from '../config/task-graph';
export declare type CachedResult = {
    terminalOutput: string;
    outputsPath: string;
    code: number;
    remote: boolean;
};
export declare type TaskWithCachedResult = {
    task: Task;
    cachedResult: CachedResult;
};
export declare class Cache {
    private readonly options;
    root: string;
    cachePath: string;
    terminalOutputsDir: string;
    useFsExtraToCopyAndRemove: boolean;
    constructor(options: DefaultTasksRunnerOptions);
    removeOldCacheRecords(): void;
    get(task: Task): Promise<CachedResult | null>;
    put(task: Task, terminalOutput: string | null, outputs: string[], code: number): Promise<void>;
    copyFilesFromCache(hash: string, cachedResult: CachedResult, outputs: string[]): Promise<void>;
    temporaryOutputPath(task: Task): string;
    private expandOutputsInWorkspace;
    private expandOutputsInCache;
    private _expandOutputs;
    private copy;
    private remove;
    private getFromLocalDir;
    private createCacheDir;
    private createTerminalOutputsDir;
    private tryAndRetry;
}
