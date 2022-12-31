import { LifeCycle } from '../../tasks-runner/life-cycle';
import { Task } from '../../config/task-graph';
import { TaskStatus } from '../../tasks-runner/tasks-runner';
export declare class StoreRunInformationLifeCycle implements LifeCycle {
    private readonly command;
    private readonly storeFile;
    private readonly now;
    private startTime;
    private timings;
    private taskResults;
    constructor(command?: string, storeFile?: typeof storeFileFunction, now?: () => string);
    startTasks(tasks: Task[]): void;
    endTasks(taskResults: Array<{
        task: Task;
        status: TaskStatus;
        code: number;
    }>): void;
    startCommand(): void;
    endCommand(): any;
}
declare function storeFileFunction(runDetails: any): void;
export {};
