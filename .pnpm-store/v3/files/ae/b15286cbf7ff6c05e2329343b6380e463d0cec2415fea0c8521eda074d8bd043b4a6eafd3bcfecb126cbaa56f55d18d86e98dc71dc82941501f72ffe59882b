import { Task } from '../../config/task-graph';
import { LifeCycle } from '../life-cycle';
import { TaskStatus } from '../tasks-runner';
export declare class TaskTimingsLifeCycle implements LifeCycle {
    private timings;
    startTasks(tasks: Task[]): void;
    endTasks(taskResults: Array<{
        task: Task;
        status: TaskStatus;
        code: number;
    }>): void;
    endCommand(): void;
}
