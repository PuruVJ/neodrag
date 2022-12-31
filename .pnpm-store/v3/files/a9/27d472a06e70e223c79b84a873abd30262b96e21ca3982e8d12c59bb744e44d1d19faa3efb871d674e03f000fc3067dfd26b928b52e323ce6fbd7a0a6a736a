import { LifeCycle, TaskMetadata } from '../life-cycle';
import { TaskStatus } from '../tasks-runner';
import { Task } from '../../config/task-graph';
export declare class TaskProfilingLifeCycle implements LifeCycle {
    private timings;
    private profile;
    private readonly profileFile;
    private registeredGroups;
    constructor(_profileFile: string);
    startTasks(tasks: Task[], { groupId }: TaskMetadata): void;
    endTasks(taskResults: Array<{
        task: Task;
        status: TaskStatus;
        code: number;
    }>, metadata: TaskMetadata): void;
    endCommand(): void;
    private recordTaskCompletions;
    private registerGroup;
}
