import { TaskStatus } from './tasks-runner';
import { Task } from '../config/task-graph';
export interface TaskResult {
    task: Task;
    status: TaskStatus;
    code: number;
    terminalOutput?: string;
}
export interface TaskMetadata {
    groupId: number;
}
export interface LifeCycle {
    startCommand?(): void;
    endCommand?(): void;
    scheduleTask?(task: Task): void;
    /**
     * @deprecated use startTasks
     *
     * startTask won't be supported after Nx 14 is released.
     */
    startTask?(task: Task): void;
    /**
     * @deprecated use endTasks
     *
     * endTask won't be supported after Nx 14 is released.
     */
    endTask?(task: Task, code: number): void;
    startTasks?(task: Task[], metadata: TaskMetadata): void;
    endTasks?(taskResults: TaskResult[], metadata: TaskMetadata): void;
    printTaskTerminalOutput?(task: Task, status: TaskStatus, output: string): void;
}
export declare class CompositeLifeCycle implements LifeCycle {
    private readonly lifeCycles;
    constructor(lifeCycles: LifeCycle[]);
    startCommand(): void;
    endCommand(): void;
    scheduleTask(task: Task): void;
    startTask(task: Task): void;
    endTask(task: Task, code: number): void;
    startTasks(tasks: Task[], metadata: TaskMetadata): void;
    endTasks(taskResults: TaskResult[], metadata: TaskMetadata): void;
    printTaskTerminalOutput(task: Task, status: TaskStatus, output: string): void;
}
